import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getYoutubeVideoId } from '../lib/youtube';
import { Course, Lesson } from '../types/database';
import { CoursesStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import Pill from '../components/Pill';
import FloatingChatButton from '../components/FloatingChatButton';
import YoutubeLessonPlayer from '../components/YoutubeLessonPlayer';

type Props = NativeStackScreenProps<CoursesStackParamList, 'CourseDetail'>;

function formatDuration(minutes: number | null) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function CourseDetailScreen({ route }: Props) {
  const { courseId } = route.params;
  const { profile } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const videoWidth = windowWidth - 40;
  const videoHeight = videoWidth * (9 / 16);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

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

  const hasPremiumAccess = profile?.tier === 'premium';

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
      setCourse(loadedCourse);
      setLessons(loadedLessons);

      const firstPlayable = loadedLessons.find(
        (lesson) =>
          lesson.is_preview || !loadedCourse?.is_premium || hasPremiumAccess
      );
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

  const handleSelectLesson = (lesson: Lesson) => {
    if (!canPlay(lesson)) return;
    setActiveLessonId(lesson.id);
  };

  return (
    <ScreenShell overlay={<FloatingChatButton />}>
      <TopBar
        rightElement={
          <View style={styles.bellButton}>
            <Feather name="bell" size={18} color={colors.text} />
          </View>
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
                allowsFullscreen
                nativeControls
              />
            ) : (
              <View style={[styles.video, styles.videoPlaceholder]}>
                <Feather name="video-off" size={28} color={colors.textFaint} />
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

          <Text style={styles.courseTitle}>{course.title}</Text>
          <View style={styles.metaRow}>
            {course.level && <Pill label={course.level} color={colors.accentGreen} />}
            {course.category && <Pill label={course.category} color={colors.link} />}
          </View>
          {!!course.description && (
            <Text style={styles.courseDescription}>{course.description}</Text>
          )}
          {!!course.instructor_name && (
            <Text style={styles.instructor}>By {course.instructor_name}</Text>
          )}

          <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
            Lessons
          </Text>
          <View style={styles.lessonsList}>
            {lessons.map((lesson, index) => {
              const isActive = lesson.id === activeLessonId;
              const locked = !canPlay(lesson);
              return (
                <Pressable
                  key={lesson.id}
                  style={[styles.lessonRow, isActive && styles.lessonRowActive]}
                  onPress={() => handleSelectLesson(lesson)}
                >
                  <View style={styles.lessonIcon}>
                    <Feather
                      name={locked ? 'lock' : isActive ? 'play' : 'play-circle'}
                      size={16}
                      color={locked ? colors.textFaint : colors.link}
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
  cardSpaced: {
    marginTop: 20,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    textAlign: 'center',
  },
  videoWrap: {
    borderRadius: 18,
    overflow: 'hidden',
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
    fontSize: 11,
    marginTop: 8,
  },
  courseTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  courseDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  instructor: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSpaced: {
    marginTop: 24,
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
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 12,
  },
  lessonRowActive: {
    borderColor: colors.accentBlue,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(245,197,24,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumPillText: {
    color: '#F5C518',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
