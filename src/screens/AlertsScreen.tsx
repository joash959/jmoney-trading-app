import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Text from '../components/AppText';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { useAlertsBadge } from '../contexts/AlertsBadgeContext';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import NotificationBell from '../components/NotificationBell';
import PageHeader from '../components/PageHeader';
import SectionHeader from '../components/SectionHeader';
import AlertCard from '../components/AlertCard';
import AnimatedNumber from '../components/AnimatedNumber';
import Skeleton from '../components/Skeleton';
import EmptyStateCard from '../components/EmptyStateCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import { detectAlertDirection } from '../lib/tradeAlertParser';
import { buildTradeThreads, TradeThread } from '../lib/tradeThreads';

type Props = BottomTabScreenProps<MainTabParamList, 'Alerts'>;

type TradeAlert = {
  id: string;
  message: string;
  created_at: string;
};

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function formatShortTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, now)) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

/** "2:25 PM" for today, otherwise "Yesterday, 2:25 PM" / "October 21, 2:25 PM". */
function whenLabel(iso: string) {
  const day = formatDateLabel(iso);
  return day === 'Today' ? formatShortTime(iso) : `${day}, ${formatShortTime(iso)}`;
}

const CORE_MARKETS = ['Gold', 'US30', 'NAS100'];

export default function AlertsScreen({ navigation }: Props) {
  const { isPremium } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const { markAlertsSeen } = useAlertsBadge();
  const connect = usePrimeXBTConnect();
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);
  const [longCount, setLongCount] = useState(0);
  const [shortCount, setShortCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [locked, setLocked] = useState(false);
  // Market tab: 'All' or an instrument such as 'Gold' / 'US30'.
  const [market, setMarket] = useState('All');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  // Finished trades are tucked away until asked for.
  const [showClosed, setShowClosed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('feature_tier_settings')
      .select('default_tier')
      .eq('feature_key', 'trade_alerts')
      .maybeSingle()
      .then(({ data, error: settingsError }) => {
        if (cancelled) return;
        if (!settingsError && data?.default_tier === 'premium') {
          setLocked(!isPremium);
        }
        setCheckingAccess(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPremium]);

  const fetchAlerts = useCallback(async () => {
    const { data: alertData, error: alertError } = await supabase
      .from('trade_alerts')
      .select('id, message, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (alertError) {
      setError(alertError.message);
      return;
    }

    setError(null);
    const rows = (alertData as TradeAlert[]) ?? [];
    setAlerts(rows);

    let long = 0;
    let short = 0;
    rows.forEach((alert) => {
      const direction = detectAlertDirection(alert.message);
      if (direction === 'long') long += 1;
      else if (direction === 'short') short += 1;
    });
    setLongCount(long);
    setShortCount(short);
  }, []);

  useEffect(() => {
    fetchAlerts().then(() => setLoading(false));
  }, [fetchAlerts]);

  useEffect(() => {
    const channel = supabase
      .channel('trade_alerts_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trade_alerts' },
        (payload) => {
          const row = payload.new as TradeAlert;
          setAlerts((prev) => {
            if (prev.some((a) => a.id === row.id)) return prev;
            return [row, ...prev].slice(0, 200);
          });
          const direction = detectAlertDirection(row.message);
          if (direction === 'long') setLongCount((count) => count + 1);
          else if (direction === 'short') setShortCount((count) => count + 1);
        }
      )
      .subscribe((status, err) => {
        console.log('[alerts] realtime status:', status, err ?? '');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useFocusEffect(
    useCallback(() => {
      markAlertsSeen();
    }, [markAlertsSeen])
  );


  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const todayCount = alerts.filter((alert) => {
    const created = new Date(alert.created_at);
    const now = new Date();
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate()
    );
  }).length;

  // Signals with their TP / SL / close updates attached, newest first.
  const threads = useMemo(() => buildTradeThreads(alerts), [alerts]);

  // A trade is active until a trigger word (closed, SL hit, cancelled...)
  // is posted for it. Updates whose signal we never saw count as past.
  const isActive = (t: TradeThread) => !!t.signal && !t.status.closed;

  // Core markets always get a tab; any other pair appears once it's traded.
  // Counts are active trades only, so "US30 1" means one live US30 trade.
  const marketTabs = useMemo(() => {
    const active = new Map<string, number>();
    const seen = new Set<string>();
    threads.forEach((t) => {
      if (!t.instrument) return;
      seen.add(t.instrument);
      if (isActive(t)) active.set(t.instrument, (active.get(t.instrument) ?? 0) + 1);
    });
    const extra = [...seen].filter((m) => !CORE_MARKETS.includes(m)).sort();
    return [
      { name: 'All', count: threads.filter(isActive).length },
      ...[...CORE_MARKETS, ...extra].map((name) => ({ name, count: active.get(name) ?? 0 })),
    ];
  }, [threads]);

  const inMarket = useMemo(
    () => (market === 'All' ? threads : threads.filter((t) => t.instrument === market)),
    [threads, market]
  );
  const activeThreads = inMarket.filter(isActive);
  const closedThreads = inMarket.filter((t) => !isActive(t));
  const activeCount = threads.filter(isActive).length;

  const directedTotal = Math.max(longCount + shortCount, 1);
  const statsRow = (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTopRow}>
        <Text style={styles.summaryLabel}>Alerts today</Text>
        <Text style={styles.summaryMeta}>
          Last {alerts[0] ? formatRelativeTime(alerts[0].created_at) : '—'}
        </Text>
      </View>
      <AnimatedNumber
        value={todayCount}
        format={(v) => String(Math.round(v))}
        style={styles.summaryValue}
      />
      <View style={styles.splitBar}>
        <View style={[styles.splitSegment, { flex: longCount || 0.0001, backgroundColor: colors.accentGreen }]} />
        <View style={[styles.splitSegment, { flex: shortCount || 0.0001, backgroundColor: colors.accentRed }]} />
        {longCount + shortCount === 0 && (
          <View style={[styles.splitSegment, { flex: 1, backgroundColor: colors.surfaceTrack }]} />
        )}
      </View>
      <View style={styles.splitLegend}>
        <Text numeric style={[styles.splitText, { color: colors.accentGreen }]}>
          {longCount} buy · {Math.round((longCount / directedTotal) * 100)}%
        </Text>
        <Text numeric style={[styles.splitText, { color: colors.accentRed }]}>
          {shortCount} sell · {Math.round((shortCount / directedTotal) * 100)}%
        </Text>
      </View>
    </View>
  );

  const statsSkeleton = <Skeleton height={150} radius={22} style={styles.summarySkeleton} />;

  if (checkingAccess) {
    return (
      <ScreenShell>
        <PageHeader title="Trade alerts" />
      </ScreenShell>
    );
  }

  if (locked) {
    return (
      <ScreenShell>
        <PageHeader
          title="Trade alerts"
          context="Premium members get every alert in real time"
          right={
            <NotificationBell
              plain
              count={unreadCount}
              onPress={() =>
                navigation.navigate('More', { screen: 'Notifications' })
              }
            />
          }
        />
        <View style={styles.fieldSpaced}>
          {loading ? statsSkeleton : statsRow}
        </View>
        <EmptyStateCard
          icon="lock-closed-outline"
          title="Premium Feature"
          subtitle="Connect and fund your PrimeXBT account to unlock real-time trade alerts."
          buttonLabel="Connect PrimeXBT"
          onPress={connect.open}
          style={styles.cardSpaced}
        />
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
      </ScreenShell>
    );
  }

  const renderThread = (thread: TradeThread, openByDefault: boolean) => {
    const head = thread.signal ?? thread.updates[0];
    const followUps = thread.signal ? thread.updates : thread.updates.slice(1);
    // The newest active trade starts open; closed ones start collapsed.
    const defaultOpen = openByDefault && thread.id === activeThreads[0]?.id;
    const open = expandedIds[thread.id] ?? defaultOpen;
    return (
      <AlertCard
        key={thread.id}
        message={head.message}
        time={whenLabel(head.created_at)}
        isNew={isActive(thread) && Date.now() - new Date(thread.lastAt).getTime() < 30 * 60000}
        status={thread.signal ? thread.status : { label: 'Past update', color: colors.textMuted, closed: true }}
        updates={followUps.map((u) => ({
          id: u.id,
          message: u.message,
          time: whenLabel(u.created_at),
        }))}
        collapsed={!open}
        onToggle={() => setExpandedIds((prev) => ({ ...prev, [thread.id]: !open }))}
      />
    );
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <PageHeader
        title="Trade alerts"
        live
        context={
          loading
            ? null
            : `${activeCount} active · ${todayCount} alerts today`
        }
        right={
          <NotificationBell
            plain
            count={unreadCount}
            onPress={() =>
              navigation.navigate('More', { screen: 'Notifications' })
            }
          />
        }
      />

      {loading ? (
        <View style={styles.fieldSpaced}>
          {statsSkeleton}
          <View style={[styles.list, styles.sectionSpaced]}>
            <Skeleton height={68} radius={16} />
            <Skeleton height={68} radius={16} />
            <Skeleton height={68} radius={16} />
          </View>
        </View>
      ) : error ? (
        <Text style={[styles.errorText, styles.fieldSpaced]}>
          Couldn't load alerts: {error}
        </Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.marketScroll}
            contentContainerStyle={styles.marketTabs}
          >
            {marketTabs.map((tab) => {
              const active = tab.name === market;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMarket(tab.name);
                  }}
                  style={[styles.marketTab, active && styles.marketTabActive]}
                >
                  <Text style={[styles.marketTabText, active && styles.marketTabTextActive]}>
                    {tab.name}
                  </Text>
                  <Text numeric style={[styles.marketTabCount, active && styles.marketTabTextActive]}>
                    {tab.count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Today's buy/sell split is about all markets - only on "All". */}
          {market === 'All' && statsRow}

          <SectionHeader
            title="Active trades"
            meta={String(activeThreads.length)}
          />
          {activeThreads.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No active {market === 'All' ? '' : `${market} `}trades
              </Text>
              <Text style={styles.emptyText}>
                New signals appear here the moment they're posted.
              </Text>
            </View>
          ) : (
            <View style={styles.groupList}>
              {activeThreads.map((thread) => renderThread(thread, true))}
            </View>
          )}

          {closedThreads.length > 0 && (
            <>
              <SectionHeader
                title="Closed"
                meta={String(closedThreads.length)}
                actionLabel={showClosed ? 'Hide' : 'Show'}
                onAction={() => setShowClosed((v) => !v)}
              />
              {showClosed && (
                <View style={styles.groupList}>
                  {closedThreads.map((thread) => renderThread(thread, false))}
                </View>
              )}
            </>
          )}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  marketScroll: {
    marginHorizontal: -20,
    marginTop: 12,
  },
  marketTabs: {
    paddingHorizontal: 20,
    gap: 8,
  },
  marketTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.glassTile,
  },
  marketTabActive: {
    backgroundColor: colors.primary,
  },
  marketTabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  marketTabTextActive: {
    color: colors.text,
  },
  marketTabCount: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    textAlign: 'center',
  },
  summaryCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: radius['2xl'],
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  summarySkeleton: {
    marginTop: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryMeta: {
    color: colors.textFaint,
    fontSize: 12,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 40,
    lineHeight: 50,
    fontWeight: '700',
    marginTop: 4,
  },
  splitBar: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginTop: 12,
  },
  splitSegment: {
    height: 8,
    borderRadius: 3,
  },
  splitLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  splitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fieldSpaced: {
    marginTop: 8,
  },
  cardSpaced: {
    marginTop: 20,
  },
  sectionSpaced: {
    marginTop: 28,
  },
  list: {
    gap: 20,
    marginTop: 16,
  },
  groupList: {
    gap: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
