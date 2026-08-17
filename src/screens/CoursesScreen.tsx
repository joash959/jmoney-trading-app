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
import FilterSheet from '../components/FilterSheet';
import CourseCard from '../components/CourseCard';
import Skeleton from '../components/Skeleton';

function CourseCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={110} radius={14} />
      <View style={styles.skeletonBody}>
        <Skeleton width="40%" height={10} />
        <Skeleton width="80%" height={15} style={styles.skeletonGapTop} />
        <Skeleton width="95%" height={11} style={styles.skeletonGapTop} />
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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);

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

  const categoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(courses.map((c) => c.category).filter((v): v is string => !!v))
    ).sort();
    return [{ label: 'All', value: null }, ...unique.map((v) => ({ label: v, value: v }))];
  }, [courses]);

  const levelOptions = useMemo(() => {
    const unique = Array.from(
      new Set(courses.map((c) => c.level).filter((v): v is string => !!v))
    ).sort();
    return [
      { label: 'All Levels', value: null },
      ...unique.map((v) => ({ label: v, value: v })),
    ];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || course.category === categoryFilter;
      const matchesLevel = !levelFilter || course.level === levelFilter;
      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [courses, search, categoryFilter, levelFilter]);

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
              tabNavigation?.navigate('More', { screen: 'Notifications' })
            }
          />
        }
      />

      <ScreenHeader
        icon="book-outline"
        title="Courses"
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search courses..."
        style={styles.searchBar}
      />
      <View style={[styles.filterRow, styles.fieldSpaced]}>
        <SelectField
          icon="grid"
          placeholder="All"
          value={categoryFilter}
          onPress={() => setCategoryModalVisible(true)}
          containerStyle={styles.filterField}
        />
        <SelectField
          icon="trending-up"
          placeholder="All Levels"
          value={levelFilter}
          onPress={() => setLevelModalVisible(true)}
          containerStyle={styles.filterField}
        />
      </View>

      {loading ? (
        <View style={[styles.grid, styles.fieldSpaced]}>
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

          <View style={styles.grid}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                style={styles.gridItem}
                level={course.level ?? 'Beginner'}
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

      <FilterSheet
        visible={categoryModalVisible}
        title="Category"
        options={categoryOptions}
        selected={categoryFilter}
        onSelect={setCategoryFilter}
        onClose={() => setCategoryModalVisible(false)}
      />
      <FilterSheet
        visible={levelModalVisible}
        title="Level"
        options={levelOptions}
        selected={levelFilter}
        onSelect={setLevelFilter}
        onClose={() => setLevelModalVisible(false)}
      />
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterField: {
    flex: 1,
  },
  resultsText: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    marginTop: 14,
  },
  gridItem: {
    width: '48%',
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    textAlign: 'center',
  },
  skeletonCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  skeletonBody: {
    padding: 12,
  },
  skeletonGapTop: {
    marginTop: 8,
  },
});
