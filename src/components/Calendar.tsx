import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Cell = { day: number; currentMonth: boolean };

function buildCells(year: number, month: number): Cell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Cell[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, currentMonth: false });
  }
  return cells;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

type DayMarker = 'profit' | 'loss' | 'flat';

type Props = {
  year: number;
  month: number;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  dayMarkers?: Record<number, DayMarker>;
};

export default function Calendar({
  year,
  month,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onToday,
  dayMarkers,
}: Props) {
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() === month;
  const todayDay = isCurrentMonth ? now.getDate() : null;

  const weeks = chunk(buildCells(year, month), 7);

  return (
    <View style={styles.card}>
      <View style={styles.navRow}>
        <Pressable style={styles.navButton} onPress={onPrevMonth} hitSlop={6}>
          <Feather name="chevron-left" size={16} color={colors.text} />
        </Pressable>
        <Pressable style={styles.todayButton} onPress={onToday}>
          <Text style={styles.todayText}>TODAY</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={onNextMonth} hitSlop={6}>
          <Feather name="chevron-right" size={16} color={colors.text} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES[month].slice(0, 3)} {year}
        </Text>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((cell, cellIndex) => {
            const isToday = cell.currentMonth && cell.day === todayDay;
            const isSelected = cell.currentMonth && cell.day === selectedDay;
            const marker = cell.currentMonth
              ? dayMarkers?.[cell.day]
              : undefined;

            return (
              <Pressable
                key={cellIndex}
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                onPress={() => cell.currentMonth && onSelectDay(cell.day)}
                disabled={!cell.currentMonth}
              >
                {isToday ? (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>{cell.day}</Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.dayText,
                      !cell.currentMonth && styles.dayTextMuted,
                    ]}
                  >
                    {cell.day}
                  </Text>
                )}
                {marker && (
                  <View
                    style={[
                      styles.marker,
                      marker === 'profit' && styles.markerProfit,
                      marker === 'loss' && styles.markerLoss,
                      marker === 'flat' && styles.markerFlat,
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  monthLabel: {
    flex: 1,
    textAlign: 'right',
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  weekdayRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingVertical: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
  },
  dayCellSelected: {
    borderWidth: 2,
    borderColor: colors.accentBlue,
    margin: -1,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
  },
  dayTextMuted: {
    color: colors.textFaint,
  },
  todayBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBadgeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  marker: {
    position: 'absolute',
    bottom: 6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  markerProfit: {
    backgroundColor: colors.accentGreen,
  },
  markerLoss: {
    backgroundColor: colors.accentRed,
  },
  markerFlat: {
    backgroundColor: colors.textFaint,
  },
});
