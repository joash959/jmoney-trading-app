import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { getNextNFP, getNextCPI } from '../lib/economicCalendar';
import { detectAlertDirection, parseAlertFields } from '../lib/tradeAlertParser';
import { useAuth } from '../contexts/AuthContext';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import ScreenShell from '../components/ScreenShell';
import NotificationBell from '../components/NotificationBell';
import SurfaceCard from '../components/SurfaceCard';
import SentimentPoll from '../components/SentimentPoll';
import LiquidGlass from '../components/LiquidGlass';
import ListRow from '../components/ListRow';
import LineChart, { ChartPoint } from '../components/LineChart';
import AnimatedNumber from '../components/AnimatedNumber';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import GradientLinkCard from '../components/GradientLinkCard';
import type { IoniconName } from '../components/IconBadge';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

type JournalEntry = { trade_date: string; profit_loss: number };
type AlertRow = { id: string; message: string; created_at: string };
type ProgressSummary = {
  total: number;
  completed: number;
  inProgress: number;
  continueCourse: { id: string; title: string } | null;
};

const RANGES = [
  { key: '1W', label: '1W', days: 7, caption: 'Past week' },
  { key: '1M', label: '1M', days: 30, caption: 'Past month' },
  { key: '3M', label: '3M', days: 90, caption: 'Past 3 months' },
  { key: '1Y', label: '1Y', days: 365, caption: 'Past year' },
] as const;
type RangeKey = (typeof RANGES)[number]['key'];

const NEW_ALERT_MINUTES = 30;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "+$1,400.00" / "-$150.00" */
function formatPnl(value: number) {
  const amount = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? '-' : '+'}$${amount}`;
}

function minutesAgo(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

function timeAgo(iso: string) {
  const minutes = minutesAgo(iso);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function daysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function shortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function labelForISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HomeScreen({ navigation }: Props) {
  const { session, profile, isPremium, refreshProfile } = useAuth();
  const userId = session?.user.id;
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [range, setRange] = useState<RangeKey>('1M');
  const [scrubPoint, setScrubPoint] = useState<ChartPoint | null>(null);
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [nextSession, setNextSession] = useState<{ date: Date; title: string } | null>(null);

  const displayName = profile?.display_name || 'Trader';
  const firstName = displayName.split(' ')[0];

  const fetchData = useCallback(async () => {
    if (!userId) return;
    const now = new Date();
    const yearAgo = toDateISO(new Date(now.getTime() - 365 * 86400000));

    const [journalRes, alertRes, coursesRes, progressRes, sessionsRes] =
      await Promise.all([
        supabase
          .from('trade_journal_entries')
          .select('trade_date, profit_loss')
          .eq('user_id', userId)
          .gte('trade_date', yearAgo)
          .order('trade_date', { ascending: true }),
        supabase
          .from('trade_alerts')
          .select('id, message, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase
          .from('user_course_progress')
          .select('course_id, completed_at, started_at, courses(title)')
          .order('started_at', { ascending: false }),
        supabase
          .from('live_sessions')
          .select('title, session_date, session_time')
          .eq('is_active', true)
          .order('session_date', { ascending: true })
          .order('session_time', { ascending: true }),
      ]);

    setEntries(
      ((journalRes.data ?? []) as JournalEntry[])
        .map((e) => ({ trade_date: e.trade_date, profit_loss: Number(e.profit_loss) }))
        .sort((a, b) => a.trade_date.localeCompare(b.trade_date))
    );
    setAlerts((alertRes.data ?? []) as AlertRow[]);

    const rows = (progressRes.data ?? []) as any[];
    const completed = rows.filter((r) => r.completed_at).length;
    const current = rows.find((r) => !r.completed_at) ?? rows[0];
    setProgress({
      total: coursesRes.count ?? 0,
      completed,
      inProgress: rows.length - completed,
      continueCourse: current
        ? { id: current.course_id, title: current.courses?.title ?? 'Your course' }
        : null,
    });

    const upcoming = (sessionsRes.data ?? []).find(
      (s: any) => new Date(`${s.session_date}T${s.session_time ?? '23:59:59'}`) >= now
    ) as any;
    setNextSession(
      upcoming
        ? { date: new Date(`${upcoming.session_date}T00:00:00`), title: upcoming.title }
        : null
    );
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), refreshProfile()]);
    setRefreshing(false);
  };

  const rangeInfo = RANGES.find((r) => r.key === range)!;

  // Cumulative P&L across the selected range, starting from zero - the
  // shape of the trader's week/month/quarter/year, like a portfolio chart.
  const { series, total, greenDays, daysLogged } = useMemo(() => {
    const start = toDateISO(new Date(Date.now() - rangeInfo.days * 86400000));
    const inRange = (entries ?? []).filter((e) => e.trade_date >= start);
    let running = 0;
    const points: ChartPoint[] = [{ label: labelForISO(start), value: 0 }];
    inRange.forEach((e) => {
      running += e.profit_loss;
      points.push({ label: labelForISO(e.trade_date), value: running });
    });
    return {
      series: points,
      total: running,
      greenDays: inRange.filter((e) => e.profit_loss > 0).length,
      daysLogged: inRange.length,
    };
  }, [entries, rangeInfo.days]);

  const lastEntry = entries && entries.length > 0 ? entries[entries.length - 1] : null;
  const shownValue = scrubPoint ? scrubPoint.value : total;
  const nextNFP = getNextNFP();
  const nextCPI = getNextCPI();

  const goMore = (
    screen: 'TradingJournal' | 'AIScanner' | 'Leaderboard' | 'Notifications' | 'MoreHome'
  ) => navigation.navigate('More', { screen });

  const quickActions: { icon: IoniconName; label: string; onPress: () => void }[] = [
    { icon: 'add', label: 'Log trade', onPress: () => goMore('TradingJournal') },
    { icon: 'scan-outline', label: 'Scanner', onPress: () => goMore('AIScanner') },
    { icon: 'trophy-outline', label: 'Ranks', onPress: () => goMore('Leaderboard') },
    { icon: 'grid-outline', label: 'More', onPress: () => goMore('MoreHome') },
  ];

  const progressTotal = Math.max(progress?.total ?? 0, 1);
  const completedPct = ((progress?.completed ?? 0) / progressTotal) * 100;
  const inProgressPct = ((progress?.inProgress ?? 0) / progressTotal) * 100;
  const pnlColor = shownValue < 0 ? colors.accentRed : colors.text;

  return (
    <ScreenShell refreshing={refreshing} onRefresh={handleRefresh}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.profileRow} onPress={() => goMore('MoreHome')}>
          <LinearGradient colors={gradients.brand} style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </LinearGradient>
          <View style={styles.greetingCol}>
            <Text style={styles.greetingLabel}>{getGreeting()}</Text>
            <Text style={styles.greetingName} numberOfLines={1}>
              Hello, {firstName}!
            </Text>
          </View>
        </Pressable>
        <NotificationBell count={unreadCount} onPress={() => goMore('Notifications')} />
      </View>

      {/* Hero: number + chart straight on the background, Robinhood-style */}
      <View style={styles.heroTopRow}>
        <Text style={styles.heroLabel}>
          Journal P&L · {scrubPoint ? scrubPoint.label : rangeInfo.caption}
        </Text>
        {isPremium && (
          <View style={styles.tierChip}>
            <Ionicons name="diamond-outline" size={12} color={colors.warning} />
            <Text style={styles.tierChipText}>Premium</Text>
          </View>
        )}
      </View>
      <View style={styles.balanceRow}>
        {hideBalance ? (
          <Text numeric style={styles.balance}>
            ••••••
          </Text>
        ) : (
          <AnimatedNumber
            value={shownValue}
            format={formatPnl}
            instant={!!scrubPoint}
            style={[styles.balance, { color: pnlColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          />
        )}
        <Pressable hitSlop={12} onPress={() => setHideBalance((h) => !h)}>
          <Ionicons
            name={hideBalance ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
      <View style={styles.subRow}>
        {daysLogged > 0 ? (
          <>
            {lastEntry && (
              <Text
                numeric
                style={[
                  styles.subText,
                  { color: lastEntry.profit_loss < 0 ? colors.accentRed : colors.accentGreen },
                ]}
              >
                {lastEntry.profit_loss < 0 ? '▼' : '▲'}{' '}
                {hideBalance ? '•••' : formatPnl(lastEntry.profit_loss)} last day
              </Text>
            )}
            <Text numeric style={styles.subText}>
              {'  ·  '}
              {greenDays}/{daysLogged} green days
            </Text>
          </>
        ) : (
          <Pressable onPress={() => goMore('TradingJournal')} style={styles.emptyCta}>
            <Text style={[styles.subText, { color: colors.link }]}>
              Log a trade in your journal to see your P&L chart
            </Text>
            <Ionicons name="arrow-forward" size={13} color={colors.link} />
          </Pressable>
        )}
      </View>

      <LineChart
        data={series}
        height={170}
        onScrub={setScrubPoint}
        style={styles.chart}
      />

      <View style={styles.rangeRow}>
        {RANGES.map((r) => {
          const active = r.key === range;
          return (
            <Pressable
              key={r.key}
              hitSlop={6}
              onPress={() => {
                if (active) return;
                Haptics.selectionAsync();
                setRange(r.key);
              }}
              style={[styles.rangePill, active && styles.rangePillActive]}
            >
              <Text numeric style={[styles.rangeText, active && styles.rangeTextActive]}>
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Quick actions: round glass buttons */}
      <View style={styles.actionsRow}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              action.onPress();
            }}
          >
            <LiquidGlass style={styles.actionGlass} tint={colors.primaryDim} interactive>
              <Ionicons name={action.icon} size={24} color={colors.primary} />
            </LiquidGlass>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {!isPremium && (
        <GradientLinkCard
          icon="link-outline"
          title="Connect your PrimeXBT account"
          subtitle="Unlock live trade alerts and premium features"
          onPress={connect.open}
          style={styles.cardSpaced}
        />
      )}

      {/* Latest alerts */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Latest alerts</Text>
        <Pressable hitSlop={8} onPress={() => navigation.navigate('Alerts')}>
          <Text style={styles.linkText}>See all</Text>
        </Pressable>
      </View>
      <SurfaceCard style={styles.listCard}>
        {alerts.length === 0 ? (
          <Text style={styles.emptyText}>
            {isPremium ? 'No alerts yet today.' : 'Connect PrimeXBT to see live trade alerts.'}
          </Text>
        ) : (
          alerts.map((alert, i) => {
            const direction = detectAlertDirection(alert.message);
            const entry = parseAlertFields(alert.message).find((f) => f.label === 'Entry');
            const isNew = minutesAgo(alert.created_at) <= NEW_ALERT_MINUTES;
            const tint =
              direction === 'long'
                ? colors.accentGreen
                : direction === 'short'
                  ? colors.accentRed
                  : colors.textMuted;
            return (
              <ListRow
                key={alert.id}
                icon={direction === 'long' ? 'trending-up' : direction === 'short' ? 'trending-down' : 'flash-outline'}
                title={alert.message.split('\n')[0].trim()}
                subtitle={entry ? `Entry ${entry.value}` : 'Trade update'}
                value={direction === 'long' ? 'BUY' : direction === 'short' ? 'SELL' : 'INFO'}
                valueColor={tint}
                subvalue={isNew ? '● New' : timeAgo(alert.created_at)}
                subvalueColor={isNew ? colors.primary : colors.textFaint}
                onPress={() => navigation.navigate('Alerts')}
                divider={i < alerts.length - 1}
              />
            );
          })
        )}
      </SurfaceCard>

      {/* Upcoming */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <Pressable hitSlop={8} onPress={() => navigation.navigate('Live')}>
          <Text style={styles.linkText}>Live sessions</Text>
        </Pressable>
      </View>
      <SurfaceCard style={styles.listCard}>
        <ListRow
          icon="videocam-outline"
          title={nextSession?.title ?? 'Live session'}
          subtitle="Next live session"
          value={nextSession ? shortDate(nextSession.date) : 'None yet'}
          subvalue={nextSession ? daysUntil(nextSession.date) : 'Check back soon'}
          subvalueColor={colors.primary}
          onPress={() => navigation.navigate('Live')}
        />
        <ListRow
          icon="briefcase-outline"
          title="Non-Farm Payrolls"
          subtitle="US · NFP release"
          value={shortDate(nextNFP.date)}
          subvalue={daysUntil(nextNFP.date)}
          subvalueColor={colors.primary}
        />
        <ListRow
          icon="pricetags-outline"
          title="Consumer Price Index"
          subtitle="US · CPI release"
          value={shortDate(nextCPI.date)}
          subvalue={daysUntil(nextCPI.date)}
          subvalueColor={colors.primary}
          divider={false}
        />
      </SurfaceCard>

      {/* Learning - compact */}
      <SurfaceCard
        style={styles.cardSpaced}
        onPress={() =>
          progress?.continueCourse
            ? navigation.navigate('Courses', {
                screen: 'CourseDetail',
                params: { courseId: progress.continueCourse.id },
              })
            : navigation.navigate('Courses', { screen: 'CoursesHome' })
        }
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Learning</Text>
          <Text numeric style={styles.progressCount}>
            {(progress?.completed ?? 0) + (progress?.inProgress ?? 0)}/{progress?.total || '—'} courses
          </Text>
        </View>
        <View style={styles.allocationBar}>
          {completedPct > 0 && (
            <View style={[styles.allocationSegment, { flex: completedPct, backgroundColor: colors.primary }]} />
          )}
          {inProgressPct > 0 && (
            <View style={[styles.allocationSegment, { flex: inProgressPct, backgroundColor: 'rgba(139,124,255,0.45)' }]} />
          )}
          <View
            style={[
              styles.allocationSegment,
              { flex: Math.max(100 - completedPct - inProgressPct, 0.01), backgroundColor: colors.surfaceTrack },
            ]}
          />
        </View>
        <View style={styles.learningFooter}>
          <Text style={styles.learningCourse} numberOfLines={1}>
            {progress?.continueCourse ? progress.continueCourse.title : 'Start your first course'}
          </Text>
          <Text style={styles.linkText}>
            {progress?.continueCourse ? 'Continue' : 'Browse'}
          </Text>
        </View>
      </SurfaceCard>

      <View style={styles.cardSpaced}>
        <SentimentPoll />
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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 22,
  },
  profileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  greetingCol: {
    flex: 1,
  },
  greetingLabel: {
    color: colors.textFaint,
    fontSize: 13,
  },
  greetingName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.warningDim,
  },
  tierChipText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  balance: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 42,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  subText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chart: {
    marginTop: 18,
    marginHorizontal: -20,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  rangePill: {
    minWidth: 54,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: 'center',
  },
  rangePillActive: {
    backgroundColor: colors.primaryDim,
  },
  rangeText: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
  rangeTextActive: {
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    paddingHorizontal: 6,
  },
  action: {
    alignItems: 'center',
    gap: 8,
    width: 72,
  },
  actionPressed: {
    transform: [{ scale: 0.94 }],
  },
  actionGlass: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  cardSpaced: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  linkText: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '500',
  },
  listCard: {
    paddingVertical: 4,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  progressCount: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  allocationBar: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginTop: 14,
  },
  allocationSegment: {
    height: 8,
    borderRadius: 3,
  },
  learningFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  learningCourse: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
  },
});
