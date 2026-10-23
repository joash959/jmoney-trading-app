import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getYoutubeVideoId } from '../lib/youtube';
import { Course, Lesson } from '../types/database';
import { CoursesStackParamList, MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import PageHeader from '../components/PageHeader';
import NotificationBell from '../components/NotificationBell';
import Pill from '../components/Pill';
import GlassCard from '../components/GlassCard';
import YoutubeLessonPlayer from '../components/YoutubeLessonPlayer';

type Props = NativeStackScreenProps<CoursesStackParamList, 'CourseDetail'>;

function formatDuration(minutes: number | null) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function CourseDetailScreen({ route, navigation }: Props) {
  const { courseId, lessonId: requestedLessonId } = route.params;
  const { isPremium: hasPremiumAccess, session } = useAuth();
  const userId = session?.user.id;
  const { count: unreadCount } = useUnreadNotificationsCount();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
  const { width: windowWidth } = useWindowDimensions();
  const videoWidth = windowWidth - 40;
  const videoHeight = videoWidth * (9 / 16);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  // Lesson ids this member has finished - shared with the website via
  // user_lesson_progress, so progress carries across both.
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState(false);

  const player = useVideoPlayer(null);

  useEffect(() => {
    const subscription = player.addListener(
      'statusChange',
      ({ status, error: statusError }) => {
        console.log('[video] statusChange', status, statusError);
        if (status === 'error') {
          setPlaybackError(statusError?.message ?? 'Unknown playback error');
        } else {
          setPlaybackError(null);
        }
      }
    );
    return () => subscription.remove();
  }, [player]);

  const canPlay = useCallback(
    (lesson: Lesson) =>
      lesson.is_preview || !course?.is_premium || hasPremiumAccess,
    [course, hasPremiumAccess]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [
        { data: courseData, error: courseError },
        { data: lessonData, error: lessonError },
      ] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
        supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true }),
      ]);

      if (cancelled) return;

      if (courseError || lessonError) {
        setError(
          (courseError ?? lessonError)?.message ?? 'Failed to load course.'
        );
        setLoading(false);
        return;
      }

      const loadedCourse = courseData as Course | null;
      const loadedLessons = (lessonData as Lesson[]) ?? [];
      if (userId && loadedLessons.length) {
        const { data: progressData } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', userId)
          .in(
            'lesson_id',
            loadedLessons.map((l) => l.id)
          );
        if (cancelled) return;
        setCompletedIds(
          new Set(
            ((progressData ?? []) as { lesson_id: string; completed: boolean | null }[])
              .filter((p) => p.completed)
              .map((p) => p.lesson_id)
          )
        );
      }
      setCourse(loadedCourse);
      setLessons(loadedLessons);

      const isPlayable = (lesson: Lesson) =>
        lesson.is_preview || !loadedCourse?.is_premium || hasPremiumAccess;
      const requested = requestedLessonId
        ? loadedLessons.find((l) => l.id === requestedLessonId && isPlayable(l))
        : undefined;
      const firstPlayable = requested ?? loadedLessons.find(isPlayable);
      setActiveLessonId(firstPlayable?.id ?? null);
      setLoading(false);
      // hasPremiumAccess is derived from profile, which is stable for the
      // lifetime of a session - re-fetching on courseId change is enough.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useEffect(() => {
    const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId);
    const url = activeLesson?.video_url;
    // YouTube links aren't playable media files - they're handled by the
    // YoutubePlayer (WebView-based) branch below instead of expo-video.
    if (url && !getYoutubeVideoId(url)) {
      player.replaceAsync(url);
    }
  }, [activeLessonId, lessons, player]);

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId);
  const youtubeId = activeLesson?.video_url
    ? getYoutubeVideoId(activeLesson.video_url)
    : null;

  // Watching a lesson enrols the member in the course (same row the
  // website's "Enroll" button creates); an existing row is left as is.
  useEffect(() => {
    if (!userId || !activeLessonId) return;
    supabase
      .from('user_course_progress')
      .upsert(
        { user_id: userId, course_id: courseId, progress_percentage: 0 },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      )
      .then(({ error: enrolError }) => {
        if (enrolError) console.warn('[progress] enrol failed', enrolError.message);
      });
  }, [userId, courseId, activeLessonId]);

  const handleMarkComplete = async () => {
    if (!userId || !activeLesson || marking) return;
    setMarking(true);
    const { error: lessonError } = await supabase.from('user_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: activeLesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );
    if (lessonError) {
      setMarking(false);
      Alert.alert("Couldn't save progress", lessonError.message);
      return;
    }
    const next = new Set(completedIds).add(activeLesson.id);
    setCompletedIds(next);
    const pct = Math.round((next.size / Math.max(lessons.length, 1)) * 100);
    await supabase
      .from('user_course_progress')
      .update({
        progress_percentage: pct,
        completed_at: pct >= 100 ? new Date().toISOString() : null,
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
    setMarking(false);
    // Move straight on to the next unfinished lesson the member can play.
    const nextLesson = lessons.find((l) => !next.has(l.id) && canPlay(l));
    if (nextLesson) setActiveLessonId(nextLesson.id);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    if (!canPlay(lesson)) return;
    setActiveLessonId(lesson.id);
  };

  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const activeDone = !!activeLesson && completedIds.has(activeLesson.id);

  return (
    <ScreenShell>
      <PageHeader
        title="Course"
        onBack={() => navigation.goBack()}
        context={
          loading || lessons.length === 0
            ? null
            : `${completedCount} of ${lessons.length} lessons done`
        }
        right={
          <NotificationBell
            plain
            count={unreadCount}
            onPress={() =>
              tabNavigation?.navigate('More', { screen: 'Notifications' })
            }
          />
        }
      />

      {loading ? (
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.cardSpaced}
        />
      ) : error ? (
        <Text style={[styles.errorText, styles.cardSpaced]}>
          Couldn't load course: {error}
        </Text>
      ) : !course ? (
        <Text style={[styles.errorText, styles.cardSpaced]}>
          Course not found.
        </Text>
      ) : (
        <>
          <View style={[styles.videoWrap, styles.cardSpaced]}>
            {youtubeId ? (
              <YoutubeLessonPlayer
                videoId={youtubeId}
                width={videoWidth}
                height={videoHeight}
              />
            ) : activeLesson?.video_url ? (
              <VideoView
                player={player}
                style={styles.video}
                fullscreenOptions={{ enable: true }}
                nativeControls
              />
            ) : (
              <View style={[styles.video, styles.videoPlaceholder]}>
                <Ionicons name="videocam-off-outline" size={28} color={colors.textFaint} />
                <Text style={styles.videoPlaceholderText}>
                  {activeLesson
                    ? 'Video not available'
                    : 'Select a lesson to start watching'}
                </Text>
              </View>
            )}
          </View>

          {__DEV__ && !youtubeId && (
            <Text style={styles.debugText}>
              video_url: {activeLesson?.video_url ?? '(none)'}
              {playbackError ? `\nplayer error: ${playbackError}` : ''}
            </Text>
          )}

          {activeLesson && (
            <Pressable
              onPress={handleMarkComplete}
              disabled={activeDone || marking}
              style={({ pressed }) => [
                styles.completeButton,
                activeDone && styles.completeButtonDone,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons
                name={activeDone ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color={activeDone ? colors.accentGreen : colors.text}
              />
              <Text style={[styles.completeText, activeDone && { color: colors.accentGreen }]}>
                {activeDone ? 'Lesson completed' : marking ? 'Saving…' : 'Mark lesson complete'}
              </Text>
            </Pressable>
          )}

          <GlassCard style={styles.cardSpaced}>
            <View style={styles.metaRow}>
              {course.level && <Pill label={course.level.charAt(0).toUpperCase() + course.level.slice(1)} color={colors.accentGreen} backgroundColor="rgba(46,230,166,0.12)" />}
              {course.category && <Pill label={course.category} color={colors.link} backgroundColor="rgba(47,107,255,0.12)" />}
            </View>
            <Text style={styles.courseTitle}>{course.title}</Text>
            {!!course.description && (
              <Text style={styles.courseDescription}>{course.description}</Text>
            )}
            {!!course.instructor_name && (
              <View style={styles.instructorRow}>
                <LinearGradient colors={gradients.brand} style={styles.instructorAvatar}>
                  <Text style={styles.instructorAvatarText}>
                    {getInitials(course.instructor_name)}
                  </Text>
                </LinearGradient>
                <View>
                  <Text style={styles.instructorLabel}>Instructor</Text>
                  <Text style={styles.instructorName}>{course.instructor_name}</Text>
                </View>
              </View>
            )}
          </GlassCard>

          <View style={[styles.sectionHeadingRow, styles.sectionSpaced]}>
            <View style={styles.sectionHeadingLeft}>
              <Ionicons name="list-outline" size={18} color={colors.link} />
              <Text style={styles.sectionTitle}>Lessons</Text>
            </View>
            <View style={styles.lessonCountPill}>
              <Text numeric style={styles.lessonCountText}>
                {completedCount}/{lessons.length} done
              </Text>
            </View>
          </View>
          <View style={styles.lessonsList}>
            {lessons.map((lesson, index) => {
              const isActive = lesson.id === activeLessonId;
              const locked = !canPlay(lesson);
              const done = completedIds.has(lesson.id);
              return (
                <Pressable
                  key={lesson.id}
                  style={[styles.lessonRow, isActive && styles.lessonRowActive]}
                  onPress={() => handleSelectLesson(lesson)}
                >
                  <View
                    style={[
                      styles.lessonIcon,
                      isActive && styles.lessonIconActive,
                      locked && styles.lessonIconLocked,
                      done && !isActive && styles.lessonIconDone,
                    ]}
                  >
                    <Ionicons
                      name={
                        locked
                          ? 'lock-closed-outline'
                          : isActive
                            ? 'play-outline'
                            : done
                              ? 'checkmark'
                              : 'play-circle-outline'
                      }
                      size={16}
                      color={
                        locked
                          ? colors.textFaint
                          : isActive
                            ? colors.text
                            : done
                              ? colors.accentGreen
                              : colors.link
                      }
                    />
                  </View>
                  <View style={styles.lessonBody}>
                    <Text
                      style={[
                        styles.lessonTitle,
                        locked && styles.lessonTitleLocked,
                      ]}
                      numberOfLines={2}
                    >
                      {index + 1}. {lesson.title}
                    </Text>
                    {!!lesson.duration_minutes && (
                      <Text style={styles.lessonDuration}>
                        {formatDuration(lesson.duration_minutes)}
                      </Text>
                    )}
                  </View>
                  {locked && (
                    <View style={styles.premiumPill}>
                      <Text style={styles.premiumPillText}>Premium</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
            {lessons.length === 0 && (
              <Text style={styles.emptyText}>
                No lessons yet for this course.
              </Text>
            )}
          </View>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  cardSpaced: {
    marginTop: 20,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    textAlign: 'center',
  },
  videoWrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.card,
  },
  videoPlaceholderText: {
    color: colors.textFaint,
    fontSize: 13,
  },
  debugText: {
    color: colors.accentRed,
    fontSize: 12,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  courseTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  courseDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorAvatarText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  instructorLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  instructorName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSpaced: {
    marginTop: 28,
  },
  lessonCountPill: {
    backgroundColor: colors.accentBlueDim,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lessonCountText: {
    color: colors.accentBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  lessonsList: {
    gap: 10,
    marginTop: 14,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.sm,
  },
  lessonRowActive: {
    backgroundColor: 'rgba(47,107,255,0.16)',
  },
  lessonIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(47,107,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIconActive: {
    backgroundColor: colors.accentBlue,
  },
  lessonIconLocked: {
    backgroundColor: colors.surfaceAlt,
  },
  lessonIconDone: {
    backgroundColor: 'rgba(46,230,166,0.14)',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
  },
  completeButtonDone: {
    backgroundColor: 'rgba(46,230,166,0.12)',
  },
  completeText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  lessonBody: {
    flex: 1,
  },
  lessonTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  lessonTitleLocked: {
    color: colors.textFaint,
  },
  lessonDuration: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
  premiumPill: {
    backgroundColor: colors.warningDim,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumPillText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
