import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { MainTabParamList, MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import GlowBackground from '../components/GlowBackground';
import TopBar from '../components/TopBar';
import ScreenHeader from '../components/ScreenHeader';
import EmptyStateCard from '../components/EmptyStateCard';

type Props = NativeStackScreenProps<MoreStackParamList, 'MarketAnalysis'>;

const MARKETS = [
  { label: 'Gold', symbol: 'OANDA:XAUUSD' },
  { label: 'EUR/USD', symbol: 'OANDA:EURUSD' },
  { label: 'GBP/USD', symbol: 'OANDA:GBPUSD' },
  { label: 'BTC/USD', symbol: 'BINANCE:BTCUSDT' },
  { label: 'US30', symbol: 'OANDA:US30USD' },
  { label: 'NAS100', symbol: 'OANDA:NAS100USD' },
];

function getWidgetHtml(symbol: string) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body { margin: 0; padding: 0; background: #0A0A0D; }
      .section-label {
        color: #FFFFFF;
        font-size: 15px;
        font-weight: 800;
        font-family: -apple-system, Roboto, sans-serif;
        padding: 14px 14px 10px 14px;
      }
      .widget-card {
        background: #17181C;
        border-radius: 14px;
        overflow: hidden;
        margin: 0 12px 20px 12px;
      }
      .tradingview-widget-container { width: 100%; }
    </style>
  </head>
  <body>
    <div class="widget-card">
      <div class="section-label">Live Chart</div>
      <div class="tradingview-widget-container">
        <div id="tradingview_chart"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          new TradingView.widget({
            "width": "100%",
            "height": 420,
            "symbol": "${symbol}",
            "interval": "60",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "backgroundColor": "#17181C",
            "gridColor": "rgba(255,255,255,0.06)",
            "toolbar_bg": "#17181C",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "hide_side_toolbar": true,
            "withdateranges": true,
            "container_id": "tradingview_chart"
          });
        </script>
      </div>
    </div>

    <div class="widget-card">
      <div class="section-label">Economic Calendar</div>
      <div class="tradingview-widget-container">
        <div class="tradingview-widget-container__widget"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-events.js" async>
        {
          "colorTheme": "dark",
          "isTransparent": true,
          "width": "100%",
          "height": "500",
          "locale": "en",
          "importanceFilter": "-1,0,1"
        }
        </script>
      </div>
    </div>
  </body>
</html>
`;
}

export default function MarketAnalysisScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [locked, setLocked] = useState(false);
  const [symbol, setSymbol] = useState(MARKETS[0].symbol);

  const widgetHtml = useMemo(() => getWidgetHtml(symbol), [symbol]);

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
          setLocked(profile?.tier !== 'premium');
        }
        setCheckingAccess(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

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
          <TopBar />
          <ScreenHeader
            icon="bar-chart-2"
            image={require('../../assets/marketanalysis.png')}
            title="Market Analysis"
          />
          <EmptyStateCard
            icon="lock"
            title="Premium Feature"
            subtitle="Connect and fund your PrimeXBT account to unlock live charts and the economic calendar."
            buttonLabel="Go to Home"
            onPress={() => tabNavigation?.navigate('Home')}
            style={styles.cardSpaced}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <GlowBackground />
      <View style={styles.headerWrap}>
        <TopBar />
        <ScreenHeader
          icon="bar-chart-2"
          image={require('../../assets/marketanalysis.png')}
          title="Market Analysis"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.marketRow}
      >
        {MARKETS.map((market) => {
          const active = market.symbol === symbol;
          return (
            <Pressable
              key={market.symbol}
              style={[styles.marketPill, active && styles.marketPillActive]}
              onPress={() => setSymbol(market.symbol)}
            >
              <Text
                style={[
                  styles.marketPillText,
                  active && styles.marketPillTextActive,
                ]}
              >
                {market.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <WebView
        key={symbol}
        source={{ html: widgetHtml }}
        style={styles.webview}
        scrollEnabled
        originWhitelist={['*']}
      />
    </SafeAreaView>
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
  headerWrap: {
    paddingHorizontal: 20,
  },
  gatedContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardSpaced: {
    marginTop: 20,
  },
  marketRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  marketPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  marketPillActive: {
    backgroundColor: colors.accentBlue,
  },
  marketPillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  marketPillTextActive: {
    color: colors.text,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
