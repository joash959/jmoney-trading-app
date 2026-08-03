import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MainTabParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import Badge from '../components/Badge';
import GradientText from '../components/GradientText';
import GlassCard from '../components/GlassCard';
import AccentCard from '../components/AccentCard';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatCard from '../components/StatCard';
import VideoCard from '../components/VideoCard';
import EmptyStateCard from '../components/EmptyStateCard';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

type LatestVideo = {
  id: string;
  courseId: string;
  title: string;
  author: string;
  duration: string;
};

type ContinueCourse = {
  courseId: string;
  title: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDuration(minutes: number | null) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function HomeScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [clientId, setClientId] = useState('');
  const [videos, setVideos] = useState<LatestVideo[]>([]);
  const [continueCourse, setContinueCourse] = useState<ContinueCourse | null>(
    null
  );

  const firstName = profile?.display_name?.split(' ')[0] || 'Trader';

  useEffect(() => {
    supabase
      .from('lessons')
      .select('id, title, duration_minutes, course_id, courses(title, instructor_name)')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (!data) return;
        setVideos(
          data.map((row: any) => ({
            id: row.id,
            courseId: row.course_id,
            title: row.title,
            author: row.courses?.instructor_name ?? 'JMONEY',
            duration: formatDuration(row.duration_minutes),
          }))
        );
      });

    supabase
      .from('user_course_progress')
      .select('course_id, updated_at, courses(title)')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as any;
        if (row?.course_id) {
          setContinueCourse({
            courseId: row.course_id,
            title: row.courses?.title ?? 'Your course',
          });
        }
      });
  }, []);

  const openCourse = (courseId: string, lessonId?: string) => {
    navigation.navigate('Courses', {
      screen: 'CourseDetail',
      params: { courseId, lessonId },
    });
  };

  return (
    <ScreenShell overlay={<FloatingChatButton />}>
      <TopBar
        rightElement={
          <Pressable style={styles.bellButton}>
            <Feather name="bell" size={18} color={colors.text} />
          </Pressable>
        }
      />

      <GlassCard style={styles.greetingCard}>
        <Badge icon="star" label={getGreeting()} />
        <View style={styles.greetingHeadingRow}>
          <Text style={styles.greetingHeading}>Welcome back, </Text>
          <GradientText style={styles.greetingHeading}>
            {firstName}
          </GradientText>
          <Text style={styles.greetingHeading}>!</Text>
        </View>
        <Text style={styles.greetingSubtitle}>
          Discover the secrets of Forex Markets and become the NEXT
          MILLIONAIRE!
        </Text>
        <View style={styles.greetingButtons}>
          <PrimaryButton
            label="Get Started"
            style={styles.getStartedButton}
          />
          <SecondaryButton label="WhatsApp" icon="message-circle" />
        </View>
      </GlassCard>

      <AccentCard style={styles.cardSpaced}>
        <View style={styles.cardHeadingRow}>
          <Feather name="shield" size={18} color={colors.text} />
          <Text style={styles.cardHeading}>Connect your PrimeXBT account</Text>
        </View>
        <Text style={styles.cardDescription}>
          Enter your PrimeXBT client ID or MT5 account number to unlock
          premium features instantly. Your account needs a minimum deposit
          of R500.
        </Text>

        <FormInput
          label="PRIMEXBT CLIENT ID"
          value={clientId}
          onChangeText={setClientId}
          placeholder="e.g. 2629398"
          keyboardType="number-pad"
          containerStyle={styles.fieldSpaced}
        />
        <Text style={styles.helperText}>
          Use your <Text style={styles.helperBold}>PrimeXBT client ID</Text>{' '}
          (7 digits, usually starting with 26), found in the PrimeXBT app
          under Profile / Account settings. MT5 account numbers often
          aren't listed on our partner report, so they may not be
          recognised.
        </Text>

        <PrimaryButton
          label="Connect & unlock premium"
          icon="shield"
          disabled={clientId.length === 0}
          style={styles.fieldSpaced}
        />
        <SecondaryButton
          label="Don't have an account? Open & fund PrimeXBT"
          icon="external-link"
          style={styles.fieldSpaced}
        />
      </AccentCard>

      <AccentCard style={styles.cardSpaced}>
        <View style={styles.cardHeadingRow}>
          <Feather name="send" size={18} color={colors.link} />
          <Text style={styles.cardHeading}>Private members channel</Text>
        </View>
        <Text style={styles.cardDescription}>
          Live trade alerts and mentorship on Telegram — for funded members
          only.
        </Text>
        <View style={styles.lockRow}>
          <Feather name="lock" size={14} color={colors.textFaint} />
          <Text style={styles.lockText}>
            Connect and fund your PrimeXBT account above (minimum R500).
            Your Telegram invite unlocks here automatically the moment it's
            verified.
          </Text>
        </View>
      </AccentCard>

      <View style={[styles.statsRow, styles.cardSpaced]}>
        <StatCard
          icon="video"
          value="No sessions"
          label="Next Live Session"
          sublabel="Check back soon"
        />
        <StatCard
          icon="sliders"
          trendLabel="4 Days To Go"
          value="Aug 7, 2026"
          label="Next NFP"
          sublabel="US Non-Farm Payrolls • 3:30 PM SAST"
        />
      </View>
      <View style={[styles.statsRow, styles.fieldSpaced]}>
        <StatCard
          icon="bar-chart-2"
          trendLabel="9 Days To Go"
          value="Aug 12, 2026"
          label="Next CPI"
          sublabel="US Consumer Price Index • 3:30 PM..."
        />
        <StatCard
          icon="award"
          trendLabel="+Growing daily"
          value="22,099"
          label="Community Members"
          sublabel="Active traders"
        />
      </View>

      {continueCourse ? (
        <EmptyStateCard
          icon="book"
          title="Continue learning"
          subtitle={continueCourse.title}
          buttonLabel="Resume Course"
          onPress={() => openCourse(continueCourse.courseId)}
          style={styles.cardSpaced}
        />
      ) : (
        <EmptyStateCard
          icon="book"
          title="No Course Started"
          subtitle="Start learning by enrolling in a course"
          buttonLabel="Browse Courses"
          onPress={() =>
            navigation.navigate('Courses', { screen: 'CoursesHome' })
          }
          style={styles.cardSpaced}
        />
      )}

      {videos.length > 0 && (
        <>
          <View style={[styles.sectionHeaderRow, styles.sectionSpaced]}>
            <View>
              <Text style={styles.sectionTitle}>Latest Videos</Text>
              <Text style={styles.sectionSubtitle}>
                Fresh content from our mentors
              </Text>
            </View>
            <Pressable
              style={styles.viewAllRow}
              onPress={() =>
                navigation.navigate('Courses', { screen: 'CoursesHome' })
              }
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="clock" size={13} color={colors.link} />
            </Pressable>
          </View>

          <View style={[styles.videoRow, styles.fieldSpaced]}>
            {videos.slice(0, 2).map((video) => (
              <VideoCard
                key={video.id}
                eyebrow="LATEST LESSON"
                title={video.title}
                author={video.author}
                duration={video.duration}
                onPress={() => openCourse(video.courseId, video.id)}
              />
            ))}
          </View>
          {videos.length > 2 && (
            <View style={[styles.videoRow, styles.fieldSpaced]}>
              {videos.slice(2, 4).map((video) => (
                <VideoCard
                  key={video.id}
                  eyebrow="LATEST LESSON"
                  title={video.title}
                  author={video.author}
                  duration={video.duration}
                  onPress={() => openCourse(video.courseId, video.id)}
                />
              ))}
            </View>
          )}
        </>
      )}

      <DisclaimerCard style={styles.cardSpaced} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  greetingCard: {
    marginTop: 16,
  },
  greetingHeadingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  greetingHeading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  greetingSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  greetingButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  getStartedButton: {
    flex: 1,
    height: 48,
  },
  cardSpaced: {
    marginTop: 20,
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
  lockRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  lockText: {
    flex: 1,
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionSpaced: {
    marginTop: 28,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  viewAllText: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '600',
  },
  videoRow: {
    flexDirection: 'row',
    gap: 14,
  },
});
