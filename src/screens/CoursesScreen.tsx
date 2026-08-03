import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import SelectField from '../components/SelectField';
import CourseCard from '../components/CourseCard';
import FloatingChatButton from '../components/FloatingChatButton';

const COURSES = [
  {
    level: 'Beginner',
    eyebrow: 'INTRODUCTION TO TECHNICAL ANALYSIS',
    instructor: 'Joash Naidoo',
    category: 'Technical Analysis',
    title: 'Technical Analysis',
    description:
      'Technical analysis can help you make sense of what drives market prices. In this course we show you how to start using charts to identify trends and opportunities.',
    duration: '2h',
    lessons: 4,
  },
  {
    level: 'Beginner',
    eyebrow: 'INTRODUCTION TO TRADING',
    instructor: 'Joash Naidoo',
    category: 'Forex',
    title: 'Introduction To Trading',
    description:
      'A beginner-friendly walkthrough covering the fundamentals every new trader needs to know before placing their first trade.',
    duration: '1h',
    lessons: 4,
  },
  {
    level: 'Beginner',
    eyebrow: 'HOW TO USE MILLIONAIRE MENTOR PLATFORM',
    instructor: 'Joash Naidoo',
    category: 'Forex',
    title: 'How to use Millionaire Mentor Platform',
    description:
      'Watch this first as it will direct you through navigation of the Millionaire Mentor Platform.',
    duration: '< 1h',
    lessons: 1,
  },
  {
    level: 'Beginner',
    eyebrow: 'HOW TO SETUP BROKER TRADING ACCOUNT',
    instructor: 'Desal Naidoo',
    category: 'Forex',
    title: 'How to setup Broker Trading Account',
    description: 'Easy how to guide on setting up your broker trading account.',
    duration: '1h',
    lessons: 1,
  },
  {
    level: 'Beginner',
    eyebrow: 'HOW TO USE METATRADER 5 MOBILE',
    instructor: 'Desal Naidoo',
    category: 'Forex',
    title: 'How to use MetaTrader 5',
    description:
      'This course will guide you through the ins and outs of MetaTrader 5.',
    duration: '1h',
    lessons: 1,
  },
  {
    level: 'Beginner',
    eyebrow: '5 BASIC TIPS ON TRADING PSYCHOLOGY',
    instructor: 'Desal Naidoo',
    category: 'Psychology',
    title: '5 Basic Tips on Trading Psychology',
    description:
      'Simple, practical tips to help you master the mental side of trading.',
    duration: '1h',
    lessons: 5,
  },
];

export default function CoursesScreen() {
  const [search, setSearch] = useState('');

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

      <Text style={styles.resultsText}>
        Showing {COURSES.length} of {COURSES.length} courses
      </Text>

      <View style={styles.list}>
        {COURSES.map((course) => (
          <CourseCard key={course.title} {...course} />
        ))}
      </View>
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
});
