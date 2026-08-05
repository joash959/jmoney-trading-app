import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import InsightCard from '../components/InsightCard';
import AlertCard from '../components/AlertCard';
import Skeleton from '../components/Skeleton';
import { detectAlertDirection } from '../lib/tradeAlertParser';

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

export default function AlertsScreen({ navigation }: Props) {
  const { count: unreadCount } = useUnreadNotificationsCount();
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);
  const [longCount, setLongCount] = useState(0);
  const [shortCount, setShortCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    const { data: alertData, error: alertError } = await supabase
      .from('trade_alerts')
      .select('id, message, created_at')
      .order('created_at', { ascending: false })
      .limit(30);

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
            return [row, ...prev].slice(0, 30);
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

  const livePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [livePulse]);

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

  const groupedAlerts = useMemo(() => {
    const groups: { label: string; items: TradeAlert[] }[] = [];
    alerts.forEach((alert) => {
      const label = formatDateLabel(alert.created_at);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === label) {
        lastGroup.items.push(alert);
      } else {
        groups.push({ label, items: [alert] });
      }
    });
    return groups;
  }, [alerts]);

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <TopBar
        rightElement={
          <NotificationBell
            count={unreadCount}
            onPress={() =>
              navigation.navigate('More', { screen: 'Notifications' })
            }
          />
        }
      />

      <ScreenHeader
        icon="bell"
        image={require('../../assets/tradealerts.png')}
        title="Trade Alerts"
        rightElement={
          <View style={styles.livePill}>
            <Animated.View
              style={[styles.liveDot, { opacity: livePulse }]}
            />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        }
      />

      {loading ? (
        <View style={styles.fieldSpaced}>
          <View style={styles.statsRow}>
            <Skeleton height={54} radius={12} style={styles.skeletonFlex} />
            <Skeleton height={54} radius={12} style={styles.skeletonFlex} />
            <Skeleton height={54} radius={12} style={styles.skeletonFlex} />
            <Skeleton height={54} radius={12} style={styles.skeletonFlex} />
          </View>
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
          <View style={styles.statsRow}>
            <InsightCard
              compact
              variant="gradient"
              icon="activity"
              label="Today"
              value={String(todayCount)}
            />
            <InsightCard
              compact
              variant="gradient"
              icon="trending-up"
              label="Long"
              value={String(longCount)}
            />
            <InsightCard
              compact
              variant="gradient"
              icon="trending-down"
              label="Short"
              value={String(shortCount)}
            />
            <InsightCard
              compact
              variant="gradient"
              icon="clock"
              label="Last Alert"
              value={alerts[0] ? formatRelativeTime(alerts[0].created_at) : '—'}
            />
          </View>

          <View style={styles.list}>
            {groupedAlerts.map((group) => (
              <View key={group.label} style={styles.group}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>{group.label}</Text>
                </View>
                <View style={styles.groupList}>
                  {group.items.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      message={alert.message}
                      time={formatShortTime(alert.created_at)}
                    />
                  ))}
                </View>
              </View>
            ))}
            {alerts.length === 0 && (
              <Text style={styles.emptyText}>No alerts yet.</Text>
            )}
          </View>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.35)',
    backgroundColor: 'rgba(37,211,102,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accentGreen,
  },
  liveText: {
    color: colors.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  fieldSpaced: {
    marginTop: 8,
  },
  sectionSpaced: {
    marginTop: 28,
  },
  list: {
    gap: 20,
    marginTop: 16,
  },
  group: {
    gap: 10,
  },
  dateRow: {
    alignItems: 'center',
  },
  dateLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  groupList: {
    gap: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  skeletonFlex: {
    flex: 1,
  },
});
