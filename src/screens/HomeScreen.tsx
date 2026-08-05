import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import SurfaceCard from '../components/SurfaceCard';
import SegmentedBar from '../components/SegmentedBar';
import PromoCarousel from '../components/PromoCarousel';
import SentimentPoll from '../components/SentimentPoll';
import PrimaryButton from '../components/PrimaryButton';
import StatCard from '../components/StatCard';
import IconTile, { iconTileGradients } from '../components/IconTile';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import GradientLinkCard from '../components/GradientLinkCard';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

type ContinueCourse = {
  courseId: string;
  title: string;
};

const PROGRESS_SEGMENTS_MAX = 10;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();
  const [continueCourse, setContinueCourse] = useState<ContinueCourse | null>(
    null
  );
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [coursesStarted, setCoursesStarted] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = profile?.display_name?.split(' ')[0] || 'Trader';
  const isPremium = profile?.tier === 'premium';

  const fetchData = async () => {
    const [{ data: progressData }, { count: totalCount }, { data: progressRows }] =
      await Promise.all([
        supabase
          .from('user_course_progress')
          .select('course_id, updated_at, courses(title)')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('user_course_progress').select('course_id'),
      ]);

    const progressRow = progressData as any;
    setContinueCourse(
      progressRow?.course_id
        ? {
            courseId: progressRow.course_id,
            title: progressRow.courses?.title ?? 'Your course',
          }
        : null
    );

    setCoursesTotal(totalCount ?? 0);
    setCoursesStarted(
      new Set((progressRows ?? []).map((row: any) => row.course_id)).size
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), refreshProfile()]);
    setRefreshing(false);
  };

  const openCourse = (courseId: string, lessonId?: string) => {
    navigation.navigate('Courses', {
      screen: 'CourseDetail',
      params: { courseId, lessonId },
    });
  };

  const quickActions = [
    {
      icon: 'book-open' as const,
      label: 'Courses',
      gradient: iconTileGradients.blue,
      image: require('../../assets/courses.png'),
      onPress: () => navigation.navigate('Courses', { screen: 'CoursesHome' }),
    },
    {
      icon: 'target' as const,
      label: 'AI Scanner',
      gradient: iconTileGradients.purple,
      image: require('../../assets/aiscanner.png'),
      onPress: () => navigation.navigate('More', { screen: 'AIScanner' }),
    },
    {
      icon: 'send' as const,
      label: 'Telegram',
      gradient: iconTileGradients.teal,
      image: require('../../assets/telegram.png'),
      onPress: () =>
        navigation.navigate('More', { screen: 'TelegramChannels' }),
    },
    {
      icon: 'video' as const,
      label: 'Live Sessions',
      gradient: iconTileGradients.green,
      image: require('../../assets/livesessions.png'),
      onPress: () => navigation.navigate('Live'),
    },
    {
      icon: 'bookmark' as const,
      label: 'Journal',
      gradient: iconTileGradients.gold,
      image: require('../../assets/tradingjournal.png'),
      onPress: () =>
        navigation.navigate('More', { screen: 'TradingJournal' }),
    },
    {
      icon: 'award' as const,
      label: 'Leaderboard',
      gradient: iconTileGradients.red,
      image: require('../../assets/leaderboard.png'),
      onPress: () => navigation.navigate('More', { screen: 'Leaderboard' }),
    },
    {
      icon: 'bar-chart-2' as const,
      label: 'Market Analysis',
      gradient: iconTileGradients.blue,
      image: require('../../assets/marketanalysis.png'),
      onPress: () =>
        navigation.navigate('More', { screen: 'MarketAnalysis' }),
    },
    {
      icon: 'phone' as const,
      label: 'Contact Us',
      gradient: iconTileGradients.purple,
      image: require('../../assets/contactus.png'),
      onPress: () => navigation.navigate('More', { screen: 'ContactUs' }),
    },
  ];

  const promoItems = [
    {
      icon: 'target' as const,
      image: require('../../assets/aiscanner.png'),
      title: 'Scan any chart',
      subtitle: 'Let AI mark key levels and call the trend instantly.',
      gradient: iconTileGradients.purple,
      onPress: () => navigation.navigate('More', { screen: 'AIScanner' }),
    },
    {
      icon: 'send' as const,
      image: require('../../assets/telegram.png'),
      title: 'Join the community',
      subtitle: 'Live trade alerts and mentorship, the moment you\'re funded.',
      gradient: iconTileGradients.teal,
      onPress: () =>
        navigation.navigate('More', { screen: 'TelegramChannels' }),
    },
    {
      icon: 'award' as const,
      image: require('../../assets/leaderboard.png'),
      title: 'Climb the leaderboard',
      subtitle: 'Compete with other traders for real prizes.',
      gradient: iconTileGradients.gold,
      onPress: () => navigation.navigate('More', { screen: 'Leaderboard' }),
    },
    {
      icon: 'book-open' as const,
      image: require('../../assets/courses.png'),
      title: 'Keep learning',
      subtitle: "New lessons added regularly — pick up where you left off.",
      gradient: iconTileGradients.blue,
      onPress: () => navigation.navigate('Courses', { screen: 'CoursesHome' }),
    },
  ];

  const displaySegments = Math.max(Math.min(coursesTotal, PROGRESS_SEGMENTS_MAX), 1);
  const filledSegments =
    coursesTotal > 0
      ? Math.max(
          Math.round((coursesStarted / coursesTotal) * displaySegments),
          coursesStarted > 0 ? 1 : 0
        )
      : 0;

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

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroHeadingTextWrap}>
            <Text style={styles.greetingLabel}>{getGreeting()}</Text>
            <Text
              style={styles.greetingHeading}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              Welcome back, {firstName}!
            </Text>
          </View>
          <View style={styles.tierPill}>
            <Feather
              name={isPremium ? 'award' : 'lock'}
              size={11}
              color={isPremium ? colors.warning : colors.textFaint}
            />
            <Text
              style={[styles.tierPillText, isPremium && styles.tierPillTextPremium]}
            >
              {isPremium ? 'PREMIUM' : 'FREE PLAN'}
            </Text>
          </View>
        </View>
      </View>

      <GradientLinkCard
        title="Connect your PrimeXBT account"
        subtitle="Unlock premium features and trade alerts"
        icon={require('../../assets/broker.png')}
        onPress={connect.open}
        style={styles.cardSpaced}
      />

      <SurfaceCard style={styles.cardSpaced}>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <IconTile
              key={action.label}
              icon={action.icon}
              label={action.label}
              gradient={action.gradient}
              image={action.image}
              onPress={action.onPress}
            />
          ))}
        </View>
      </SurfaceCard>

      <GradientLinkCard
        title="View JMONEY Trade Alerts"
        subtitle="Real-time trade alert insights"
        icon={require('../../assets/tradealerts.png')}
        onPress={() => navigation.navigate('Alerts')}
        style={styles.cardSpaced}
      />

      <View style={styles.cardSpaced}>
        <PromoCarousel items={promoItems} />
      </View>

      <View style={styles.cardSpaced}>
        <SentimentPoll />
      </View>

      <SurfaceCard style={styles.cardSpaced}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.cardHeading}>Your Progress</Text>
          <Feather name="chevron-right" size={18} color={colors.textFaint} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Courses started</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {coursesStarted}/{coursesTotal || '—'}
            </Text>
          </View>
        </View>
        <SegmentedBar
          segments={displaySegments}
          filled={filledSegments}
          filledColor={colors.warning}
          style={styles.progressBarSpaced}
        />
        <PrimaryButton
          label={continueCourse ? 'Continue Course' : 'Start Course'}
          icon={null}
          variant="flat"
          onPress={() =>
            continueCourse
              ? openCourse(continueCourse.courseId)
              : navigation.navigate('Courses', { screen: 'CoursesHome' })
          }
          style={styles.fieldSpaced}
        />
      </SurfaceCard>

      <View style={[styles.statsRow, styles.cardSpaced]}>
        <StatCard
          icon="video"
          image={require('../../assets/livesessions.png')}
          value="No sessions"
          label="Next Live Session"
          sublabel="Check back soon"
        />
        <StatCard
          icon="sliders"
          image={require('../../assets/marketanalysis.png')}
          trendLabel="4 Days To Go"
          value="Aug 7, 2026"
          label="Next NFP"
          sublabel="US Non-Farm Payrolls • 3:30 PM SAST"
        />
      </View>
      <View style={[styles.statsRow, styles.fieldSpaced]}>
        <StatCard
          icon="bar-chart-2"
          image={require('../../assets/marketanalysis.png')}
          trendLabel="9 Days To Go"
          value="Aug 12, 2026"
          label="Next CPI"
          sublabel="US Consumer Price Index • 3:30 PM..."
        />
        <StatCard
          icon="award"
          image={require('../../assets/dashboard.png')}
          trendLabel="+Growing daily"
          value="22,099"
          label="Community Members"
          sublabel="Active traders"
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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroHeadingTextWrap: {
    flex: 1,
  },
  greetingLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surfaceAlt,
  },
  tierPillText: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tierPillTextPremium: {
    color: colors.warning,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  greetingHeading: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    marginTop: 1,
  },
  cardSpaced: {
    marginTop: 20,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  countPill: {
    backgroundColor: colors.accentBlueDim,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillText: {
    color: colors.accentBlue,
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarSpaced: {
    marginTop: 12,
  },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardHeading: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  fieldSpaced: {
    marginTop: 16,
  },
  helperText: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  helperBold: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  successText: {
    color: colors.accentGreen,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
