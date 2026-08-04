import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { Course } from '../types/database';
import { CoursesStackParamList, MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import SelectField from '../components/SelectField';
import CourseCard from '../components/CourseCard';
import Skeleton from '../components/Skeleton';
import FloatingChatButton from '../components/FloatingChatButton';

function CourseCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={150} radius={20} />
      <View style={styles.skeletonBody}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={18} style={styles.skeletonGapTop} />
        <Skeleton width="95%" height={13} style={styles.skeletonGapTop} />
      </View>
    </View>
  );
}

type Props = NativeStackScreenProps<CoursesStackParamList, 'CoursesHome'>;

function formatDuration(hours: number | null) {
  if (!hours) return '< 1h';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours}h`;
}

export default function CoursesScreen({ navigation }: Props) {
  const { count: unreadCount } = useUnreadNotificationsCount();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setCourses((data as Course[]) ?? []);
    }
  }, []);

  useEffect(() => {
    fetchCourses().then(() => setLoading(false));
  }, [fetchCourses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    );
  }, [courses, search]);

  return (
    <ScreenShell
      overlay={<FloatingChatButton />}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <TopBar
        rightElement={
          <NotificationBell
            count={unreadCount}
            onPress={() =>
              tabNavigation?.navigate('More', { screen: 'Notifications' })
            }
          />
        }
      />

      <ScreenHeader
        icon="book-open"
        image={require('../../assets/courses.png')}
        title="Courses"
        subtitle="Master trading with our comprehensive video courses"
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search courses..."
        style={styles.searchBar}
      />
      <SelectField placeholder="All" containerStyle={styles.fieldSpaced} />
      <SelectField
        placeholder="All Levels"
        containerStyle={styles.fieldSpaced}
      />

      {loading ? (
        <View style={[styles.list, styles.fieldSpaced]}>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </View>
      ) : error ? (
        <Text style={[styles.errorText, styles.fieldSpaced]}>
          Couldn't load courses: {error}
        </Text>
      ) : (
        <>
          <Text style={styles.resultsText}>
            Showing {filteredCourses.length} of {courses.length} courses
          </Text>

          <View style={styles.list}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                level={course.level ?? 'Beginner'}
                eyebrow={course.title.toUpperCase()}
                instructor={course.instructor_name ?? 'JMONEY'}
                category={course.category ?? 'Trading'}
                title={course.title}
                description={course.description ?? ''}
                duration={formatDuration(course.duration_hours)}
                lessons={course.lessons_count ?? 0}
                onPress={() =>
                  navigation.navigate('CourseDetail', { courseId: course.id })
                }
              />
            ))}
          </View>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 20,
  },
  fieldSpaced: {
    marginTop: 12,
  },
  resultsText: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 18,
  },
  list: {
    gap: 20,
    marginTop: 14,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  skeletonBody: {
    padding: 16,
  },
  skeletonGapTop: {
    marginTop: 10,
  },
});
