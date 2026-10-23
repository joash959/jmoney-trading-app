import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { getNextNFP, getNextCPI } from '../lib/economicCalendar';
import { parseAlertFields } from '../lib/tradeAlertParser';
import { buildTradeThreads } from '../lib/tradeThreads';
import { useAuth } from '../contexts/AuthContext';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import ScreenShell from '../components/ScreenShell';
import NotificationBell from '../components/NotificationBell';
import SurfaceCard from '../components/SurfaceCard';
import SentimentPoll from '../components/SentimentPoll';
import LineChart, { ChartPoint } from '../components/LineChart';
import AnimatedNumber from '../components/AnimatedNumber';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import GradientLinkCard from '../components/GradientLinkCard';
import type { IoniconName } from '../components/IconBadge';
import LevelCard from '../components/LevelCard';
import SectionHeader from '../components/SectionHeader';
import DailyMissions from '../components/DailyMissions';
import BadgeUnlockedModal from '../components/BadgeUnlockedModal';
import { useBadgeUnlocks } from '../hooks/useBadgeUnlocks';
import { useAlertsBadge } from '../contexts/AlertsBadgeContext';
import Icon3D from '../components/Icon3D';
import { ICON_3D } from '../lib/icon3dMap';
import XpToast, { XpToastHandle } from '../components/XpToast';
import { useGameStats } from '../hooks/useGameStats';
import { XP } from '../lib/gamification';

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

/** Short label for a follow-up alert ("NAS100 TP1 HIT ✅ ..."). */
function describeUpdate(message: string) {
  if (/\b(tp\s*\d?|take\s*profit|target)\b[^\n]*\bhit\b/i.test(message)) {
    return { label: 'TP hit', color: colors.accentGreen };
  }
  if (/\b(sl|stop(\s*loss)?)\b[^\n]*\bhit\b|\bstopped\s*out\b/i.test(message)) {
    return { label: 'SL hit', color: colors.accentRed };
  }
  return { label: 'Update', color: colors.primary };
}

const ALERT_CARD_WIDTH = 250;

/** Upcoming event: a calendar-page date block, the event, and a countdown. */
function TimelineRow({
  date,
  title,
  subtitle,
  tag,
  last,
  onPress,
}: {
  date: Date | null;
  title: string;
  subtitle: string;
  tag: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const soon = tag === 'Today' || tag === 'Tomorrow';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.timelineRow, !last && styles.timelineDivider, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.dateBlock}>
        <Text style={styles.dateMonth}>
          {date ? date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBA'}
        </Text>
        <Text numeric style={styles.dateDay}>
          {date ? date.getDate() : '–'}
        </Text>
      </View>
      <View style={styles.timelineText}>
        <Text style={styles.timelineTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.timelineSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.countdown, soon && styles.countdownSoon]}>
        <Text style={[styles.countdownText, soon && { color: colors.accentGreen }]}>{tag}</Text>
      </View>
    </Pressable>
  );
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
  const { stats: gameStats, refresh: refreshGame } = useGameStats();
  const { celebrate, dismiss: dismissCelebration } = useBadgeUnlocks(gameStats, userId);
  const { unseenCount: unseenAlerts } = useAlertsBadge();
  const xpToast = useRef<XpToastHandle>(null);
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
          // Enough history to attach recent updates to their signals.
          .limit(40),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase
          .from('user_course_progress')
          .select('course_id, completed_at, started_at, courses(title)')
          .order('started_at', { ascending: false }),
        supabase
          .from('live_sessions')
          .select('title, session_date, session_time, duration')
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

    // Same rule as the Live tab: a session counts until it has ended.
    const upcoming = (sessionsRes.data ?? []).find((s: any) => {
      const start = new Date(`${s.session_date}T${s.session_time ?? '23:59:59'}`);
      return start.getTime() + (s.duration ?? 60) * 60000 >= now.getTime();
    }) as any;
    setNextSession(
      upcoming
        ? { date: new Date(`${upcoming.session_date}T00:00:00`), title: upcoming.title }
        : null
    );
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // XP can change elsewhere (journal, courses) - refresh on return.
  useFocusEffect(
    useCallback(() => {
      refreshGame();
    }, [refreshGame])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), refreshProfile(), refreshGame()]);
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
    screen: 'TradingJournal' | 'AIScanner' | 'MarketAnalysis' | 'TelegramChannels' | 'Notifications' | 'MoreHome'
  ) => navigation.navigate('More', { screen });

  const quickActions: { icon: IoniconName; label: string; onPress: () => void }[] = [
    { icon: 'add', label: 'Log trade', onPress: () => goMore('TradingJournal') },
    { icon: 'scan-outline', label: 'Scanner', onPress: () => goMore('AIScanner') },
    { icon: 'stats-chart-outline', label: 'Analysis', onPress: () => goMore('MarketAnalysis') },
    { icon: 'paper-plane-outline', label: 'Telegram', onPress: () => goMore('TelegramChannels') },
  ];

  const pnlColor = shownValue < 0 ? colors.accentRed : colors.text;
  // Only trades still open - closed and stopped-out ones live on the Alerts tab.
  const activeTrades = buildTradeThreads(alerts).filter((t) => t.signal && !t.status.closed);

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={handleRefresh}
      overlay={<XpToast ref={xpToast} />}
    >
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
            <View style={styles.actionGlass}>
              <Icon3D name={ICON_3D[action.icon] ?? 'star'} size={52} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {!isPremium && (
        <GradientLinkCard
          icon="link-outline"
          title="Connect your PrimeXBT account"
          subtitle="Unlock live trade alerts and premium features"
          gradient={gradients.brand}
          onPress={connect.open}
          style={styles.cardSpaced}
        />
      )}

      {/* Latest alerts */}
      <SectionHeader
        title="Active trades"
        actionLabel="See all"
        onAction={() => navigation.navigate('Alerts')}
      />
      {activeTrades.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>
            {isPremium
              ? 'No active trades right now. New signals show here the moment they post.'
              : 'Connect PrimeXBT to see live trade alerts.'}
          </Text>
        </SurfaceCard>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={ALERT_CARD_WIDTH + 12}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {activeTrades.slice(0, 5).map((thread) => {
            const alert = thread.signal ?? thread.updates[0];
            const direction = thread.signal ? thread.direction : null;
            const fields = parseAlertFields(alert.message);
            const field = (label: string) => fields.find((f) => f.label === label)?.value;
            const isNew = minutesAgo(thread.lastAt) <= NEW_ALERT_MINUTES;
            const update = direction ? null : describeUpdate(alert.message);
            const tint =
              direction === 'long'
                ? colors.accentGreen
                : direction === 'short'
                  ? colors.accentRed
                  : update!.color;
            const stats = [
              { label: 'Entry', value: field('Entry') },
              { label: 'TP', value: field('TP1') ?? field('TP2') },
              { label: 'SL', value: field('SL') },
            ].filter((f) => f.value);
            return (
              <Pressable
                key={thread.id}
                onPress={() => navigation.navigate('Alerts')}
                style={({ pressed }) => [styles.alertCard, pressed && styles.pressed]}
              >
                <View style={styles.alertTop}>
                  <Icon3D
                    name={direction === 'long' ? 'chart-up' : direction === 'short' ? 'chart-down' : 'bell'}
                    size={34}
                  />
                  <View style={[styles.alertPill, { backgroundColor: `${tint}22` }]}>
                    <Text style={[styles.alertPillText, { color: tint }]}>
                      {direction === 'long' ? 'BUY' : direction === 'short' ? 'SELL' : update!.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.alertTitle} numberOfLines={1}>
                  {alert.message.split('\n')[0].trim()}
                </Text>
                {stats.length > 0 ? (
                  <View style={styles.alertStats}>
                    {stats.map((f) => (
                      <View key={f.label} style={styles.alertStat}>
                        <Text style={styles.alertStatLabel}>{f.label}</Text>
                        <Text numeric style={styles.alertStatValue} numberOfLines={1} adjustsFontSizeToFit>
                          {f.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.alertBody} numberOfLines={2}>
                    {alert.message.split('\n').slice(1).join(' ').trim() || 'Trade update'}
                  </Text>
                )}
                <View style={styles.alertFooter}>
                  {thread.signal ? (
                    <Text style={[styles.alertStatus, { color: thread.status.color }]}>
                      ● {thread.status.label}
                    </Text>
                  ) : (
                    <Text style={styles.alertStatus}>Update</Text>
                  )}
                  <Text style={[styles.alertTime, isNew && { color: colors.link }]}>
                    {isNew ? 'New' : timeAgo(thread.lastAt)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.cardSpaced}>
        <SentimentPoll
          onVoted={() => {
            xpToast.current?.show(XP.pollVote, 'Vote cast');
            refreshGame();
          }}
        />
      </View>

      {/* Upcoming - next session, learning, macro events */}
      <SectionHeader
        title="Upcoming"
        actionLabel="Live sessions"
        onAction={() => navigation.navigate('Live')}
      />
      <SurfaceCard style={styles.timelineCard}>
        <TimelineRow
          date={nextSession?.date ?? null}
          title={nextSession?.title ?? 'Live session'}
          subtitle="Live session with J Money"
          tag={nextSession ? daysUntil(nextSession.date) : 'Check back soon'}
          onPress={() => navigation.navigate('Live')}
        />
        <TimelineRow
          date={nextNFP.date}
          title="Non-Farm Payrolls"
          subtitle="US · High impact"
          tag={daysUntil(nextNFP.date)}
        />
        <TimelineRow
          date={nextCPI.date}
          title="Consumer Price Index"
          subtitle="US · High impact"
          tag={daysUntil(nextCPI.date)}
          last
        />
      </SurfaceCard>

      {/* Continue learning - its own banner, not another list row */}
      <Pressable
        onPress={() =>
          progress?.continueCourse
            ? navigation.navigate('Courses', {
                screen: 'CourseDetail',
                params: { courseId: progress.continueCourse.id },
              })
            : navigation.navigate('Courses', { screen: 'CoursesHome' })
        }
        style={({ pressed }) => [styles.learnCard, pressed && styles.pressed]}
      >
        <Icon3D name="books" size={52} />
        <View style={styles.learnText}>
          <Text style={styles.learnKicker}>
            {progress?.continueCourse ? 'Continue learning' : 'Start learning'}
          </Text>
          <Text style={styles.learnTitle} numberOfLines={1}>
            {progress?.continueCourse ? progress.continueCourse.title : 'Browse trading courses'}
          </Text>
          <View style={styles.learnTrack}>
            <View
              style={[
                styles.learnFill,
                {
                  width: `${
                    progress?.total ? Math.round(((progress.completed ?? 0) / progress.total) * 100) : 0
                  }%`,
                },
              ]}
            />
          </View>
          <Text numeric style={styles.learnMeta}>
            {progress?.completed ?? 0} of {progress?.total || '—'} courses completed
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </Pressable>

      {/* Your progress - level, streak and today's missions together */}
      <SectionHeader
        title="Your progress"
        actionLabel="Badges"
        onAction={() => goMore('MoreHome')}
      />
      <LevelCard
        stats={gameStats}
        onPress={() => goMore('MoreHome')}
      />

      <DailyMissions
        style={styles.missions}
        missions={[
          {
            key: 'log',
            icon: 'journal',
            title: "Log today's trades",
            xp: XP.journalEntry,
            done: !!gameStats?.loggedToday,
            onPress: () => goMore('TradingJournal'),
          },
          {
            key: 'vote',
            icon: 'ballot',
            title: 'Vote in the market poll',
            xp: XP.pollVote,
            done: !!gameStats?.votedToday,
          },
          {
            key: 'alerts',
            icon: 'alerts',
            title: 'Catch up on trade alerts',
            xp: 0,
            done: unseenAlerts === 0,
            onPress: () => navigation.navigate('Alerts'),
          },
        ]}
      />

      <BadgeUnlockedModal badge={celebrate} onClose={dismissCelebration} />

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
  missions: {
    marginTop: 12,
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
  carousel: {
    marginHorizontal: -20,
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  alertCard: {
    width: ALERT_CARD_WIDTH,
    borderRadius: 22,
    backgroundColor: colors.card,
    padding: 16,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  alertPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  alertTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  alertStats: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  alertStat: {
    flex: 1,
    backgroundColor: colors.glassTile,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 7,
  },
  alertStatLabel: {
    color: colors.textFaint,
    fontSize: 11,
  },
  alertStatValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  alertBody: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    minHeight: 36,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  alertStatus: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  alertTime: {
    color: colors.textFaint,
    fontSize: 12,
  },
  timelineCard: {
    paddingVertical: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  timelineDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dateBlock: {
    width: 50,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.glassTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    color: colors.link,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  dateDay: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '700',
  },
  timelineText: {
    flex: 1,
  },
  timelineTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  timelineSubtitle: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  countdown: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.glassTile,
  },
  countdownSoon: {
    backgroundColor: 'rgba(46,230,166,0.14)',
  },
  countdownText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  learnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: colors.card,
    padding: 16,
  },
  learnText: {
    flex: 1,
  },
  learnKicker: {
    color: colors.link,
    fontSize: 12,
    fontWeight: '600',
  },
  learnTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  learnTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceTrack,
    marginTop: 10,
    overflow: 'hidden',
  },
  learnFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  learnMeta: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: 14,
  },
});
