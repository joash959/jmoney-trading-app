import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { fonts } from '../theme/fonts';
import { shadows } from '../theme/shadows';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { parseFunctionError } from '../lib/functionError';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import Badge from '../components/Badge';
import SurfaceCard from '../components/SurfaceCard';
import SegmentedBar from '../components/SegmentedBar';
import PromoCarousel from '../components/PromoCarousel';
import SentimentPoll from '../components/SentimentPoll';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatCard from '../components/StatCard';
import IconTile, { iconTileGradients } from '../components/IconTile';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';

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
  const [clientId, setClientId] = useState('');
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [continueCourse, setContinueCourse] = useState<ContinueCourse | null>(
    null
  );
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [coursesStarted, setCoursesStarted] = useState(0);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
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

  const handleConnect = async () => {
    if (!clientId.trim()) return;
    setVerifyError(null);
    setVerifyMessage(null);
    setVerifyLoading(true);

    const { data, error } = await supabase.functions.invoke(
      'primexbt-verify',
      { body: { action: 'verify', brokerId: clientId.trim() } }
    );

    setVerifyLoading(false);

    if (error) {
      setVerifyError(await parseFunctionError(error));
      return;
    }
    if (!data?.found) {
      setVerifyError(
        "We couldn't find that PrimeXBT client ID. Double-check it's your 7-digit client ID, not your MT5 account number."
      );
      return;
    }
    if (data.funded) {
      setVerifyMessage(
        data.upgraded
          ? 'Account verified and funded — premium unlocked! 🎉'
          : 'Account verified and funded.'
      );
      refreshProfile();
    } else {
      setVerifyMessage(
        'Account found, but not yet funded. Fund your account (minimum R500) to unlock premium features.'
      );
    }
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

      <SurfaceCard style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Badge icon="star" label={getGreeting()} />
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
        <Text
          style={styles.greetingHeading}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
        >
          Welcome back, {firstName}!
        </Text>
        <Text style={styles.greetingSubtitle}>
          Discover the secrets of Forex Markets and become the NEXT
          MILLIONAIRE!
        </Text>
        <View style={styles.greetingButtons}>
          <PrimaryButton
            label="Get Started"
            icon={null}
            variant="flat"
            style={styles.heroButton}
          />
          <SecondaryButton label="WhatsApp us" style={styles.heroButton} />
        </View>
      </SurfaceCard>

      <Pressable
        onPress={() => setConnectModalVisible(true)}
        style={({ pressed }) => [styles.cardSpaced, pressed && styles.connectPressed]}
      >
        <LinearGradient
          colors={gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.connectCard}
        >
          <Feather
            name="arrow-right"
            size={20}
            color={colors.text}
            style={styles.connectArrow}
          />
          <View style={styles.connectRow}>
            <View style={styles.connectTextCol}>
              <Text style={styles.connectTitle}>
                Connect your PrimeXBT account
              </Text>
              <Text style={styles.connectSubtitle}>
                Unlock premium features and trade alerts
              </Text>
            </View>
            <Image
              source={require('../../assets/broker.png')}
              style={styles.connectIcon}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </Pressable>

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

      <Pressable
        onPress={() => navigation.navigate('Alerts')}
        style={({ pressed }) => [styles.cardSpaced, pressed && styles.connectPressed]}
      >
        <LinearGradient
          colors={gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.connectCard}
        >
          <Feather
            name="arrow-right"
            size={20}
            color={colors.text}
            style={styles.connectArrow}
          />
          <View style={styles.connectRow}>
            <View style={styles.connectTextCol}>
              <Text style={styles.connectTitle}>View JMONEY Trade Alerts</Text>
              <Text style={styles.connectSubtitle}>
                Real-time trade alert insights
              </Text>
            </View>
            <Image
              source={require('../../assets/tradealerts.png')}
              style={styles.connectIcon}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </Pressable>

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
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        clientId={clientId}
        onChangeClientId={setClientId}
        onConnect={handleConnect}
        loading={verifyLoading}
        successMessage={verifyMessage}
        errorMessage={verifyError}
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
    justifyContent: 'space-between',
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
    marginTop: spacing.md,
    ...typography.display,
  },
  greetingSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    fontFamily: fonts.poppinsSemiBold,
  },
  greetingButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroButton: {
    flex: 1,
    height: 48,
  },
  cardSpaced: {
    marginTop: 20,
  },
  connectCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    position: 'relative',
    ...shadows.glow,
  },
  connectPressed: {
    opacity: 0.85,
  },
  connectArrow: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  connectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  connectTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
    paddingRight: 24,
  },
  connectSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 6,
  },
  connectIcon: {
    width: 72,
    height: 72,
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
