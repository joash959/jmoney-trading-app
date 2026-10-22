import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { supabase } from '../lib/supabase';
import { getCommunityCount } from '../lib/communityCount';
import { getNextNFP, getNextCPI } from '../lib/economicCalendar';
import { detectAlertDirection, parseAlertFields } from '../lib/tradeAlertParser';
import { useAuth } from '../contexts/AuthContext';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import ScreenShell from '../components/ScreenShell';
import NotificationBell from '../components/NotificationBell';
import SurfaceCard from '../components/SurfaceCard';
import GlassSheen from '../components/GlassSheen';
import PromoCarousel from '../components/PromoCarousel';
import SentimentPoll from '../components/SentimentPoll';
import IconTile from '../components/IconTile';
import IconBadge from '../components/IconBadge';
import ListRow from '../components/ListRow';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import GradientLinkCard from '../components/GradientLinkCard';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

type JournalSummary = {
  total: number;
  daysLogged: number;
  winDays: number;
  lastPnl: number | null;
  lastDate: string | null;
};

type LatestAlert = {
  message: string;
  createdAt: string;
};

type ProgressSummary = {
  total: number;
  completed: number;
  inProgress: number;
  continueCourse: { id: string; title: string } | null;
};

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

function timeAgo(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
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

export default function HomeScreen({ navigation }: Props) {
  const { session, profile, isPremium, refreshProfile } = useAuth();
  const userId = session?.user.id;
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [journal, setJournal] = useState<JournalSummary | null>(null);
  const [latestAlert, setLatestAlert] = useState<LatestAlert | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [nextSession, setNextSession] = useState<{ date: Date; title: string } | null>(null);

  const displayName = profile?.display_name || 'Trader';
  const firstName = displayName.split(' ')[0];

  const fetchData = useCallback(async () => {
    if (!userId) return;
    const now = new Date();
    const monthStart = toDateISO(new Date(now.getFullYear(), now.getMonth(), 1));

    const [journalRes, alertRes, coursesRes, progressRes, sessionsRes] =
      await Promise.all([
        supabase
          .from('trade_journal_entries')
          .select('trade_date, profit_loss')
          .eq('user_id', userId)
          .gte('trade_date', monthStart)
          .order('trade_date', { ascending: false }),
        supabase
          .from('trade_alerts')
          .select('message, created_at')
          .order('created_at', { ascending: false })
          .limit(1),
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

    const entries = (journalRes.data ?? []) as { trade_date: string; profit_loss: number }[];
    setJournal({
      total: entries.reduce((sum, e) => sum + Number(e.profit_loss), 0),
      daysLogged: entries.length,
      winDays: entries.filter((e) => Number(e.profit_loss) > 0).length,
      lastPnl: entries[0] ? Number(entries[0].profit_loss) : null,
      lastDate: entries[0]?.trade_date ?? null,
    });

    const alertRow = (alertRes.data ?? [])[0] as { message: string; created_at: string } | undefined;
    setLatestAlert(alertRow ? { message: alertRow.message, createdAt: alertRow.created_at } : null);

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

  const nextNFP = getNextNFP();
  const nextCPI = getNextCPI();

  const goMore = (screen: 'TradingJournal' | 'AIScanner' | 'Leaderboard' | 'TelegramChannels' | 'MarketAnalysis' | 'Notifications') =>
    navigation.navigate('More', { screen });

  const quickActions = [
    { icon: 'create-outline' as const, label: 'Journal', onPress: () => goMore('TradingJournal') },
    { icon: 'scan-outline' as const, label: 'Scanner', onPress: () => goMore('AIScanner') },
    { icon: 'trophy-outline' as const, label: 'Ranks', onPress: () => goMore('Leaderboard') },
    { icon: 'grid-outline' as const, label: 'Menu', onPress: () => navigation.navigate('More', { screen: 'MoreHome' }) },
  ];

  const promoItems = [
    {
      icon: 'paper-plane-outline' as const,
      title: 'Join the community',
      subtitle: `${getCommunityCount().toLocaleString('en-US')} traders get live alerts and mentorship on Telegram.`,
      onPress: () => goMore('TelegramChannels'),
    },
    {
      icon: 'stats-chart-outline' as const,
      title: 'Market analysis',
      subtitle: 'Live charts for gold, indices and forex.',
      onPress: () => goMore('MarketAnalysis'),
    },
    {
      icon: 'scan-outline' as const,
      title: 'Scan any chart',
      subtitle: 'Let AI mark key levels and call the trend instantly.',
      onPress: () => goMore('AIScanner'),
    },
  ];

  const pnl = journal?.total ?? 0;
  const alertDirection = latestAlert ? detectAlertDirection(latestAlert.message) : null;
  const alertTitle = latestAlert
    ? latestAlert.message.split('\n')[0].trim().slice(0, 40)
    : 'Trade alerts';
  const alertEntry = latestAlert
    ? parseAlertFields(latestAlert.message).find((f) => f.label === 'Entry')
    : undefined;

  const progressTotal = Math.max(progress?.total ?? 0, 1);
  const completedPct = ((progress?.completed ?? 0) / progressTotal) * 100;
  const inProgressPct = ((progress?.inProgress ?? 0) / progressTotal) * 100;

  return (
    <ScreenShell refreshing={refreshing} onRefresh={handleRefresh}>
      {/* Header: avatar + greeting, bell on the right */}
      <View style={styles.header}>
        <Pressable
          style={styles.profileRow}
          onPress={() => navigation.navigate('More', { screen: 'MoreHome' })}
        >
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

      {/* Hero balance card */}
      <View style={styles.heroCard}>
        <LinearGradient
          colors={gradients.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <GlassSheen />
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>This month's P&L</Text>
          <View style={[styles.tierChip, isPremium && styles.tierChipPremium]}>
            <Ionicons
              name={isPremium ? 'diamond-outline' : 'lock-closed-outline'}
              size={11}
              color={isPremium ? colors.warning : colors.textFaint}
            />
            <Text style={[styles.tierChipText, isPremium && styles.tierChipTextPremium]}>
              {isPremium ? 'Premium' : 'Free plan'}
            </Text>
          </View>
        </View>
        <View style={styles.balanceRow}>
          <Text
            style={[styles.balance, pnl < 0 && styles.balanceNegative]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {hideBalance ? '••••••' : formatPnl(pnl)}
          </Text>
          <Pressable hitSlop={10} onPress={() => setHideBalance((h) => !h)}>
            <Ionicons
              name={hideBalance ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {journal && journal.daysLogged > 0 ? (
            <>
              {journal.lastPnl !== null && (
                <View style={[styles.chip, journal.lastPnl < 0 ? styles.chipRed : styles.chipGreen]}>
                  <Ionicons
                    name={journal.lastPnl < 0 ? 'caret-down' : 'caret-up'}
                    size={10}
                    color={journal.lastPnl < 0 ? colors.accentRed : colors.accentGreen}
                  />
                  <Text style={[styles.chipText, { color: journal.lastPnl < 0 ? colors.accentRed : colors.accentGreen }]}>
                    {hideBalance ? '•••' : formatPnl(journal.lastPnl)} last day
                  </Text>
                </View>
              )}
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {journal.winDays}/{journal.daysLogged} green days
                </Text>
              </View>
            </>
          ) : (
            <Pressable style={styles.chip} onPress={() => goMore('TradingJournal')}>
              <Text style={styles.chipText}>Log your first trade in the journal</Text>
              <Ionicons name="arrow-forward" size={11} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <View style={styles.actionsRow}>
          {quickActions.map((action) => (
            <IconTile
              key={action.label}
              icon={action.icon}
              label={action.label}
              onPress={action.onPress}
            />
          ))}
        </View>
      </View>

      {/* Trade alerts - latest signal */}
      <GradientLinkCard
        icon="flash-outline"
        title={latestAlert ? alertTitle : 'View JMONEY trade alerts'}
        subtitle={
          latestAlert
            ? [alertEntry ? `Entry ${alertEntry.value}` : null, timeAgo(latestAlert.createdAt)]
                .filter(Boolean)
                .join(' · ')
            : 'Real-time trade alert insights'
        }
        glyph={alertDirection === 'short' ? 'trending-down' : alertDirection === 'long' ? 'trending-up' : 'arrow-forward'}
        onPress={() => navigation.navigate('Alerts')}
        style={styles.spaced}
      />

      {/* Broker connection */}
      {isPremium ? (
        <SurfaceCard onPress={connect.open} style={[styles.spaced, styles.statusCard]}>
          <IconBadge
            icon="checkmark"
            size={40}
            color={colors.accentGreen}
            backgroundColor="rgba(46,230,166,0.12)"
          />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>PrimeXBT connected</Text>
            <Text style={styles.statusSubtitle}>Verified and funded</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </SurfaceCard>
      ) : (
        <GradientLinkCard
          icon="link-outline"
          title="Connect your PrimeXBT account"
          subtitle="Unlock premium features and trade alerts"
          onPress={connect.open}
          style={styles.spaced}
        />
      )}

      {/* Learning progress - allocation bar */}
      <SurfaceCard
        style={styles.spaced}
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
          <Text style={styles.cardTitle}>Learning progress</Text>
          <Text style={styles.linkText}>
            {progress?.continueCourse ? 'Continue' : 'Browse courses'}
          </Text>
        </View>
        <View style={styles.progressValueRow}>
          <Text style={styles.progressValue}>
            {(progress?.completed ?? 0) + (progress?.inProgress ?? 0)}
          </Text>
          <Text style={styles.progressOf}>
            {' '}of {progress?.total || '—'} courses started
          </Text>
        </View>
        <View style={styles.allocationBar}>
          {completedPct > 0 && (
            <View style={[styles.allocationSegment, { flex: completedPct, backgroundColor: colors.accentGreen }]} />
          )}
          {inProgressPct > 0 && (
            <View style={[styles.allocationSegment, { flex: inProgressPct, backgroundColor: colors.accentBlue }]} />
          )}
          <View style={[styles.allocationSegment, { flex: Math.max(100 - completedPct - inProgressPct, 0.01), backgroundColor: colors.surfaceTrack }]} />
        </View>
        <View style={styles.legendRow}>
          <LegendDot color={colors.accentGreen} label={`${progress?.completed ?? 0} completed`} />
          <LegendDot color={colors.accentBlue} label={`${progress?.inProgress ?? 0} in progress`} />
          {progress?.continueCourse && (
            <Text style={styles.legendCourse} numberOfLines={1}>
              {progress.continueCourse.title}
            </Text>
          )}
        </View>
      </SurfaceCard>

      <View style={styles.spaced}>
        <SentimentPoll />
      </View>

      {/* Upcoming - watchlist-style list */}
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
          subvalueColor={colors.link}
          onPress={() => navigation.navigate('Live')}
        />
        <ListRow
          icon="briefcase-outline"
          title="Non-Farm Payrolls"
          subtitle="US · NFP release"
          value={shortDate(nextNFP.date)}
          subvalue={daysUntil(nextNFP.date)}
          subvalueColor={colors.link}
        />
        <ListRow
          icon="pricetags-outline"
          title="Consumer Price Index"
          subtitle="US · CPI release"
          value={shortDate(nextCPI.date)}
          subvalue={daysUntil(nextCPI.date)}
          subvalueColor={colors.link}
          divider={false}
        />
      </SurfaceCard>

      <Text style={[styles.sectionTitle, styles.exploreTitle]}>Explore</Text>
      <View style={styles.carouselSpaced}>
        <PromoCarousel items={promoItems} />
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
        title={isPremium ? 'Connect a different PrimeXBT account' : undefined}
        description={
          isPremium
            ? "You're already connected and funded. Enter a different PrimeXBT client ID to switch accounts."
            : undefined
        }
        confirmLabel={isPremium ? 'Connect different account' : undefined}
      />
    </ScreenShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 18,
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
  heroCard: {
    borderRadius: radius['2xl'],
    padding: 20,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.cardBorderTop,
    overflow: 'hidden',
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
    backgroundColor: colors.glassTile,
  },
  tierChipPremium: {
    backgroundColor: colors.warningDim,
  },
  tierChipText: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
  },
  tierChipTextPremium: {
    color: colors.warning,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  balance: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 38,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  balanceNegative: {
    color: colors.accentRed,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.glassTile,
  },
  chipGreen: {
    backgroundColor: 'rgba(46,230,166,0.12)',
  },
  chipRed: {
    backgroundColor: 'rgba(255,77,106,0.12)',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  spaced: {
    marginTop: 14,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  statusSubtitle: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 1,
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
  linkText: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '500',
  },
  progressValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  progressValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  progressOf: {
    color: colors.textMuted,
    fontSize: 14,
  },
  allocationBar: {
    flexDirection: 'row',
    gap: 3,
    height: 10,
    marginTop: 14,
  },
  allocationSegment: {
    height: 10,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  legendCourse: {
    flex: 1,
    color: colors.textFaint,
    fontSize: 12,
    textAlign: 'right',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  listCard: {
    paddingVertical: 4,
  },
  exploreTitle: {
    marginTop: 28,
    marginBottom: 10,
  },
  carouselSpaced: {
    marginBottom: 8,
  },
});
