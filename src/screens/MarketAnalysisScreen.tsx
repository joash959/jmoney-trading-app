import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import GlowBackground from '../components/GlowBackground';
import PageHeader from '../components/PageHeader';
import NotificationBell from '../components/NotificationBell';
import EmptyStateCard from '../components/EmptyStateCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import ScreenShell from '../components/ScreenShell';
import SectionHeader from '../components/SectionHeader';
import SurfaceCard from '../components/SurfaceCard';
import Skeleton from '../components/Skeleton';
import Icon3D from '../components/Icon3D';
import { buildTradeThreads, AlertRow, TradeThread } from '../lib/tradeThreads';
import { parseAlertFields } from '../lib/tradeAlertParser';

type Props = NativeStackScreenProps<MoreStackParamList, 'MarketAnalysis'>;

type MarketKey = 'Gold' | 'US30' | 'NAS100';

const MARKETS: { key: MarketKey; pair: string; symbol: string }[] = [
  { key: 'Gold', pair: 'XAU/USD', symbol: 'OANDA:XAUUSD' },
  { key: 'US30', pair: 'Dow Jones 30', symbol: 'OANDA:US30USD' },
  { key: 'NAS100', pair: 'Nasdaq 100', symbol: 'OANDA:NAS100USD' },
];

const TIMEFRAMES = [
  { value: '15', label: '15m' },
  { value: '60', label: '1H' },
  { value: '240', label: '4H' },
  { value: 'D', label: '1D' },
  { value: 'W', label: '1W' },
] as const;
type Timeframe = (typeof TIMEFRAMES)[number]['value'];

// Solid fill behind the chart, so the web canvas and the native card match.
const CHART_BG = colors.surface;

/**
 * Only TradingView's candles - no toolbars, legend or page chrome. Uses the
 * embed widget, whose backgroundColor and gridColor settings are officially
 * supported, so the chart is painted in exactly the card's colour and the
 * two read as one surface. Posts 'ready' once the chart frame has loaded.
 */
function chartHtml(symbol: string, interval: string, full: boolean) {
  const up = colors.accentGreen;
  const down = colors.accentRed;
  const config = {
    autosize: true,
    symbol,
    interval,
    timezone: 'Etc/UTC',
    theme: 'dark',
    style: '1',
    locale: 'en',
    backgroundColor: CHART_BG,
    gridColor: 'rgba(255,255,255,0.04)',
    hide_top_toolbar: !full,
    hide_side_toolbar: !full,
    hide_legend: !full,
    hide_volume: true,
    allow_symbol_change: false,
    save_image: false,
    withdateranges: false,
    calendar: false,
    details: false,
    hotlist: false,
    support_host: 'https://www.tradingview.com',
    // Brand candle colours, where the widget accepts them.
    overrides: {
      'mainSeriesProperties.candleStyle.upColor': up,
      'mainSeriesProperties.candleStyle.downColor': down,
      'mainSeriesProperties.candleStyle.borderUpColor': up,
      'mainSeriesProperties.candleStyle.borderDownColor': down,
      'mainSeriesProperties.candleStyle.wickUpColor': up,
      'mainSeriesProperties.candleStyle.wickDownColor': down,
      'paneProperties.backgroundType': 'solid',
      'paneProperties.background': CHART_BG,
      'scalesProperties.textColor': colors.textFaint,
      'scalesProperties.lineColor': CHART_BG,
    },
  };
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="preconnect" href="https://s3.tradingview.com" />
<link rel="preconnect" href="https://s.tradingview.com" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; width: 100%; background: ${CHART_BG}; overflow: hidden; }
  .tradingview-widget-container, .tradingview-widget-container__widget { height: 100%; width: 100%; background: ${CHART_BG}; }
  .tradingview-widget-copyright { display: none; }
  iframe { background: ${CHART_BG}; }
</style>
</head><body>
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
</div>
<script>
  (function () {
    var sent = false;
    var send = function () {
      if (sent) return; sent = true;
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ready');
    };
    new MutationObserver(function (_, obs) {
      var frame = document.querySelector('iframe');
      if (frame) { obs.disconnect(); frame.addEventListener('load', function () { setTimeout(send, 400); }); }
    }).observe(document.body, { childList: true, subtree: true });
    setTimeout(send, 8000);
  })();
</script>
<script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
${JSON.stringify(config)}
</script>
</body></html>`;
}

/** Gold and the index CFDs trade Sunday 22:00 to Friday 21:00 UTC, with a daily 21:00-22:00 break. */
function isMarketOpen(now = new Date()) {
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  if (day === 6) return false;
  if (day === 5 && hour >= 21) return false;
  if (day === 0 && hour < 22) return false;
  return hour !== 21;
}

/** Keeps the WebView on the chart: links (TradingView logo etc.) open in the browser. */
function stayOnChart(request: ShouldStartLoadRequest) {
  const url = request.url;
  if (request.isTopFrame === false) return true;
  if (!/^https?:/.test(url)) return true;
  Linking.openURL(url).catch(() => {});
  return false;
}

function ChartView({ html, onReady }: { html: string; onReady: () => void }) {
  return (
    <WebView
      source={{ html }}
      originWhitelist={['*']}
      onMessage={onReady}
      onShouldStartLoadWithRequest={stayOnChart}
      setSupportMultipleWindows={false}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      cacheEnabled
      cacheMode="LOAD_CACHE_ELSE_NETWORK"
      style={styles.webview}
      containerStyle={styles.webview}
    />
  );
}

/**
 * Switching market or timeframe loads the new chart underneath and only
 * swaps once it has drawn, so the card never flashes empty. A skeleton
 * shows only on the very first load.
 */
function Chart({ symbol, interval, full = false }: { symbol: string; interval: string; full?: boolean }) {
  const html = useMemo(() => chartHtml(symbol, interval, full), [symbol, interval, full]);
  // The chart on screen, and the one loading underneath it (same instance
  // is kept when it becomes visible, so it never reloads).
  const [shown, setShown] = useState<string | null>(null);
  const layers = shown && shown !== html ? [shown, html] : [html];
  const loading = shown !== html;

  return (
    <View style={[styles.chartFrame, full && styles.fullChartFrame]}>
      {!shown && (
        <View style={styles.chartLoading} pointerEvents="none">
          <Skeleton height={14} width="40%" />
          <Skeleton height={190} radius={12} style={styles.chartLoadingBlock} />
          <Skeleton height={10} width="70%" />
        </View>
      )}
      {layers.map((layer) => (
        <View
          key={layer}
          style={[styles.chartFill, layer !== shown && styles.chartPending]}
          pointerEvents={layer === shown ? 'auto' : 'none'}
        >
          <ChartView html={layer} onReady={() => layer === html && setShown(layer)} />
        </View>
      ))}
      {loading && !!shown && (
        <View style={styles.chartSpinner} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.textFaint} />
        </View>
      )}
    </View>
  );
}

export default function MarketAnalysisScreen({ navigation }: Props) {
  const { isPremium } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [locked, setLocked] = useState(false);
  const [market, setMarket] = useState<MarketKey>('Gold');
  const [timeframe, setTimeframe] = useState<Timeframe>('60');
  const [fullScreen, setFullScreen] = useState(false);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);

  const current = MARKETS.find((m) => m.key === market)!;
  const open = isMarketOpen();

  // Active trades per market, from the same Telegram alerts the Alerts tab uses.
  const activeByMarket = useMemo(() => {
    const threads = buildTradeThreads(alerts).filter((t) => t.signal && !t.status.closed);
    const by = new Map<string, TradeThread[]>();
    threads.forEach((t) => {
      if (!t.instrument) return;
      by.set(t.instrument, [...(by.get(t.instrument) ?? []), t]);
    });
    return by;
  }, [alerts]);
  const marketTrades = activeByMarket.get(market) ?? [];

  useEffect(() => {
    if (locked || checkingAccess) return;
    supabase
      .from('trade_alerts')
      .select('id, message, created_at')
      .order('created_at', { ascending: false })
      .limit(120)
      .then(({ data }) => setAlerts((data as AlertRow[]) ?? []));
  }, [locked, checkingAccess]);

  const openAlerts = () => navigation.getParent()?.navigate('Alerts' as never);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('feature_tier_settings')
      .select('default_tier')
      .eq('feature_key', 'market_analysis')
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.default_tier === 'premium') {
          setLocked(!isPremium);
        }
        setCheckingAccess(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPremium]);

  if (checkingAccess) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <GlowBackground />
        <ActivityIndicator color={colors.accentBlue} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (locked) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <GlowBackground />
        <View style={styles.gatedContent}>
          <PageHeader
            title="Market analysis"
            onBack={() => navigation.goBack()}
            right={
              <NotificationBell
                plain
                count={unreadCount}
                onPress={() => navigation.navigate('Notifications')}
              />
            }
          />
          <EmptyStateCard
            icon="lock-closed-outline"
            title="Premium Feature"
            subtitle="Connect and fund your PrimeXBT account to unlock live charts and the economic calendar."
            buttonLabel="Connect PrimeXBT"
            onPress={connect.open}
            style={styles.cardSpaced}
          />
        </View>
        <PrimeXBTConnectModal
          visible={connect.visible}
          onClose={connect.close}
          clientId={connect.clientId}
          onChangeClientId={connect.setClientId}
          onConnect={connect.handleConnect}
          loading={connect.loading}
          successMessage={connect.successMessage}
          errorMessage={connect.errorMessage}
        />
      </SafeAreaView>
    );
  }

  return (
    <ScreenShell>
      <PageHeader
        title="Market analysis"
        onBack={() => navigation.goBack()}
        context={open ? 'Markets open' : 'Markets closed'}
        live={open}
        right={
          <NotificationBell
            plain
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      {/* Market tabs - same look as the Alerts tab, with active trade counts */}
      <View style={styles.marketTabs}>
        {MARKETS.map((m) => {
          const active = m.key === market;
          const count = activeByMarket.get(m.key)?.length ?? 0;
          return (
            <Pressable
              key={m.key}
              style={[styles.marketTab, active && styles.marketTabActive]}
              onPress={() => {
                if (active) return;
                Haptics.selectionAsync();
                setMarket(m.key);
              }}
            >
              <Text style={[styles.marketTabText, active && styles.marketTabTextActive]}>{m.key}</Text>
              {count > 0 && (
                <Text numeric style={[styles.marketTabCount, active && styles.marketTabTextActive]}>
                  {count}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Chart card: native title row and timeframes around the candles */}
      <View style={styles.chartCard}>
        <View style={styles.chartHead}>
          <View style={styles.chartTitleCol}>
            <Text style={styles.chartTitle}>{current.key}</Text>
            <Text style={styles.chartPair}>{current.pair}</Text>
          </View>
          <View style={[styles.statusChip, open ? styles.statusOpen : styles.statusClosed]}>
            <View style={[styles.statusDot, { backgroundColor: open ? colors.accentGreen : colors.textFaint }]} />
            <Text style={[styles.statusText, { color: open ? colors.accentGreen : colors.textFaint }]}>
              {open ? 'Live' : 'Closed'}
            </Text>
          </View>
          <Pressable
            hitSlop={10}
            style={styles.expandButton}
            onPress={() => setFullScreen(true)}
            accessibilityLabel="Open full-screen chart"
          >
            <Ionicons name="expand-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <Chart symbol={current.symbol} interval={timeframe} />

        <View style={styles.timeframes}>
          {TIMEFRAMES.map((tf) => {
            const active = tf.value === timeframe;
            return (
              <Pressable
                key={tf.value}
                style={[styles.timeframe, active && styles.timeframeActive]}
                onPress={() => {
                  if (active) return;
                  Haptics.selectionAsync();
                  setTimeframe(tf.value);
                }}
              >
                <Text numeric style={[styles.timeframeText, active && styles.timeframeTextActive]}>
                  {tf.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Active trades on this market */}
      <SectionHeader
        title={`Active ${market} trades`}
        actionLabel="All alerts"
        onAction={openAlerts}
      />
      {marketTrades.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>
            No active {market} trades right now. New signals show here and on the Alerts tab.
          </Text>
        </SurfaceCard>
      ) : (
        <SurfaceCard style={styles.listCard}>
          {marketTrades.slice(0, 4).map((t, i) => {
            const fields = parseAlertFields(t.signal!.message);
            const field = (label: string) => fields.find((f) => f.label === label)?.value;
            const long = t.direction === 'long';
            const tint = long ? colors.accentGreen : colors.accentRed;
            return (
              <Pressable
                key={t.id}
                onPress={openAlerts}
                style={({ pressed }) => [styles.tradeRow, i > 0 && styles.rowDivider, pressed && styles.pressed]}
              >
                <Icon3D name={long ? 'chart-up' : 'chart-down'} size={34} />
                <View style={styles.tradeMain}>
                  <Text style={styles.tradeTitle}>
                    <Text style={{ color: tint }}>{long ? 'BUY' : 'SELL'}</Text>
                    {field('Entry') ? `  ·  Entry ${field('Entry')}` : ''}
                  </Text>
                  <Text numeric style={styles.tradeMeta} numberOfLines={1}>
                    {[field('TP1') && `TP ${field('TP1')}`, field('SL') && `SL ${field('SL')}`]
                      .filter(Boolean)
                      .join('  ·  ') || 'Levels in the alert'}
                  </Text>
                </View>
                <View style={[styles.tradeStatus, { backgroundColor: `${t.status.color}22` }]}>
                  <Text style={[styles.tradeStatusText, { color: t.status.color }]}>{t.status.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </SurfaceCard>
      )}

      <Text style={styles.footnote}>
        Charts by TradingView. Market data is for education only, not financial advice.
      </Text>

      <Modal
        visible={fullScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setFullScreen(false)}
      >
        <SafeAreaView style={styles.fullScreen} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.fullHead}>
            <Pressable hitSlop={10} onPress={() => setFullScreen(false)} accessibilityLabel="Close chart">
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.fullTitle}>
              {current.key} <Text style={styles.chartPair}>{current.pair}</Text>
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.fullChart}>
            <Chart symbol={current.symbol} interval={timeframe} full />
          </View>
        </SafeAreaView>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
  },
  gatedContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardSpaced: {
    marginTop: 20,
  },
  pressed: {
    opacity: 0.7,
  },

  marketTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  marketTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.glassTile,
  },
  marketTabActive: {
    backgroundColor: colors.text,
  },
  marketTabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  marketTabTextActive: {
    color: colors.background,
  },
  marketTabCount: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },

  chartCard: {
    backgroundColor: CHART_BG,
    borderRadius: 22,
    overflow: 'hidden',
    paddingTop: 16,
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  chartTitleCol: {
    flex: 1,
  },
  chartTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  chartPair: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusOpen: {
    backgroundColor: 'rgba(46,230,166,0.12)',
  },
  statusClosed: {
    backgroundColor: colors.glassTile,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  expandButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassTile,
  },
  chartFrame: {
    height: 400,
  },
  chartFill: {
    ...StyleSheet.absoluteFill,
  },
  chartPending: {
    opacity: 0,
  },
  chartSpinner: {
    position: 'absolute',
    top: 10,
    right: 14,
  },
  chartLoading: {
    ...StyleSheet.absoluteFill,
    padding: 16,
    gap: 14,
    justifyContent: 'center',
  },
  chartLoadingBlock: {
    marginVertical: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: CHART_BG,
  },
  timeframes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  timeframe: {
    flex: 1,
    height: 32,
    marginHorizontal: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeActive: {
    backgroundColor: colors.surfaceElevated,
  },
  timeframeText: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: colors.text,
  },

  listCard: {
    paddingVertical: 4,
  },
  emptyText: {
    color: colors.textFaint,
    fontSize: 14,
    lineHeight: 20,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  tradeMain: {
    flex: 1,
    minWidth: 0,
  },
  tradeTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  tradeMeta: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  tradeStatus: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 999,
    justifyContent: 'center',
  },
  tradeStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footnote: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 20,
  },

  fullScreen: {
    flex: 1,
    backgroundColor: CHART_BG,
  },
  fullHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  fullTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  fullChart: {
    flex: 1,
  },
  fullChartFrame: {
    flex: 1,
    height: undefined,
  },
});
