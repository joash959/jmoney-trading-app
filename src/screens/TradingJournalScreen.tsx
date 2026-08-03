import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import BackButton from '../components/BackButton';
import Calendar from '../components/Calendar';
import SectionLabel from '../components/SectionLabel';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<RootStackParamList, 'TradingJournal'>;

const today = new Date();

export default function TradingJournalScreen({ navigation }: Props) {
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const selectedDay =
    selectedDate.getFullYear() === viewDate.getFullYear() &&
    selectedDate.getMonth() === viewDate.getMonth()
      ? selectedDate.getDate()
      : null;

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const handleSelectDay = (day: number) =>
    setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));

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
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerIcon}>
          <Feather name="bookmark" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Trading Journal</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Track your daily trading performance
      </Text>

      <View style={[styles.summaryBar, styles.cardSpaced]}>
        <Text style={styles.summaryLabel}>Monthly:</Text>
        <View style={styles.summaryPills}>
          <View style={styles.pnlPill}>
            <Text style={styles.pnlText}>$0.00</Text>
          </View>
          <View style={styles.daysPill}>
            <Text style={styles.daysText}>0 days</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardSpaced}>
        <Calendar
          year={viewDate.getFullYear()}
          month={viewDate.getMonth()}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      </View>

      <SectionLabel>WEEKLY SUMMARY</SectionLabel>
      <View style={[styles.emptyCard, styles.fieldSpaced]}>
        <Text style={styles.emptyText}>No entries yet this month</Text>
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
    fontSize: 22,
    fontWeight: '800',
    flexShrink: 1,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 10,
  },
  cardSpaced: {
    marginTop: 20,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pnlPill: {
    backgroundColor: 'rgba(37,211,102,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pnlText: {
    color: colors.accentGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  daysPill: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  daysText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldSpaced: {
    marginTop: 12,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
