import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { Course } from '../types/database';
import { CoursesStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import SelectField from '../components/SelectField';
import CourseCard from '../components/CourseCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<CoursesStackParamList, 'CoursesHome'>;

function formatDuration(hours: number | null) {
  if (!hours) return '< 1h';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours}h`;
}

export default function CoursesScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setCourses((data as Course[]) ?? []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
    <ScreenShell overlay={<FloatingChatButton />}>
      <TopBar
        rightElement={
          <View style={styles.bellButton}>
            <Feather name="bell" size={18} color={colors.text} />
          </View>
        }
      />

      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Feather name="book-open" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Courses</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Master trading with our comprehensive video courses
      </Text>

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
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.fieldSpaced}
        />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
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
});
