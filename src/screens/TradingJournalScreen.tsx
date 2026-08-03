import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TradeJournalEntry } from '../types/database';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import Calendar from '../components/Calendar';
import SectionLabel from '../components/SectionLabel';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'TradingJournal'>;

const today = new Date();

function toDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function TradingJournalScreen({}: Props) {
  const { session } = useAuth();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<TradeJournalEntry[]>([]);

  const [pnlInput, setPnlInput] = useState('');
  const [tradesInput, setTradesInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);

  const selectedDateISO = toDateISO(selectedDate);
  const selectedEntry = entries.find((e) => e.trade_date === selectedDateISO);

  useEffect(() => {
    if (!session) return;
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    start.setDate(start.getDate() - 7);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

    supabase
      .from('trade_journal_entries')
      .select('*')
      .gte('trade_date', toDateISO(start))
      .lte('trade_date', toDateISO(end))
      .then(({ data }) => {
        setEntries((data as TradeJournalEntry[]) ?? []);
      });
  }, [viewDate, session]);

  useEffect(() => {
    setEntryError(null);
    if (selectedEntry) {
      setPnlInput(String(selectedEntry.profit_loss));
      setTradesInput(String(selectedEntry.number_of_trades));
      setNotesInput(selectedEntry.notes ?? '');
    } else {
      setPnlInput('');
      setTradesInput('');
      setNotesInput('');
    }
    // selectedEntry is derived from entries + selectedDateISO; re-running
    // when selectedDateISO changes is what actually matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateISO]);

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

  const refetch = () => setViewDate(new Date(viewDate));

  const handleSave = async () => {
    if (!session) return;
    const pnl = parseFloat(pnlInput);
    const trades = parseInt(tradesInput, 10);
    if (Number.isNaN(pnl) || Number.isNaN(trades)) {
      setEntryError('Enter a valid P&L amount and number of trades.');
      return;
    }
    setEntryError(null);
    setSaving(true);

    const payload = {
      user_id: session.user.id,
      trade_date: selectedDateISO,
      profit_loss: pnl,
      number_of_trades: trades,
      notes: notesInput.trim() || null,
    };

    const { error } = selectedEntry
      ? await supabase
          .from('trade_journal_entries')
          .update(payload)
          .eq('id', selectedEntry.id)
      : await supabase.from('trade_journal_entries').insert(payload);

    setSaving(false);
    if (error) {
      setEntryError(error.message);
      return;
    }
    refetch();
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    const { error } = await supabase
      .from('trade_journal_entries')
      .delete()
      .eq('id', selectedEntry.id);
    setSaving(false);
    if (error) {
      setEntryError(error.message);
      return;
    }
    refetch();
  };

  const monthlyEntries = entries.filter((e) => {
    const d = new Date(e.trade_date);
    return (
      d.getFullYear() === viewDate.getFullYear() &&
      d.getMonth() === viewDate.getMonth()
    );
  });
  const monthlyPnl = monthlyEntries.reduce((sum, e) => sum + e.profit_loss, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const weeklyEntries = entries
    .filter((e) => {
      const d = new Date(e.trade_date);
      return d >= weekStart && d <= today;
    })
    .sort((a, b) => (a.trade_date < b.trade_date ? 1 : -1));

  const dayMarkers = Object.fromEntries(
    monthlyEntries.map((e) => [
      new Date(e.trade_date).getDate(),
      e.profit_loss > 0
        ? ('profit' as const)
        : e.profit_loss < 0
          ? ('loss' as const)
          : ('flat' as const),
    ])
  );

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
          <View
            style={[
              styles.pnlPill,
              monthlyPnl < 0 && styles.pnlPillNegative,
            ]}
          >
            <Text
              style={[
                styles.pnlText,
                monthlyPnl < 0 && styles.pnlTextNegative,
              ]}
            >
              {monthlyPnl >= 0 ? '$' : '-$'}
              {Math.abs(monthlyPnl).toFixed(2)}
            </Text>
          </View>
          <View style={styles.daysPill}>
            <Text style={styles.daysText}>
              {monthlyEntries.length} day
              {monthlyEntries.length === 1 ? '' : 's'}
            </Text>
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
          dayMarkers={dayMarkers}
        />
      </View>

      <View style={[styles.entryCard, styles.cardSpaced]}>
        <Text style={styles.entryDate}>{formatDayLabel(selectedDate)}</Text>
        <View style={styles.entryRow}>
          <FormInput
            label="P&L ($)"
            value={pnlInput}
            onChangeText={setPnlInput}
            placeholder="0.00"
            keyboardType="numbers-and-punctuation"
            containerStyle={styles.entryField}
          />
          <FormInput
            label="TRADES"
            value={tradesInput}
            onChangeText={setTradesInput}
            placeholder="0"
            keyboardType="number-pad"
            containerStyle={styles.entryField}
          />
        </View>
        <FormInput
          label="NOTES"
          value={notesInput}
          onChangeText={setNotesInput}
          placeholder="What happened today?"
          containerStyle={styles.fieldSpaced}
        />
        {entryError && <Text style={styles.errorText}>{entryError}</Text>}
        <View style={styles.entryButtonsRow}>
          <PrimaryButton
            label={saving ? 'Saving...' : selectedEntry ? 'Update entry' : 'Save entry'}
            icon={null}
            disabled={saving}
            onPress={handleSave}
            style={styles.entryButton}
          />
          {selectedEntry && (
            <SecondaryButton
              label="Delete"
              icon="trash-2"
              onPress={handleDelete}
            />
          )}
        </View>
      </View>

      <SectionLabel>WEEKLY SUMMARY</SectionLabel>
      {weeklyEntries.length === 0 ? (
        <View style={[styles.emptyCard, styles.fieldSpaced]}>
          <Text style={styles.emptyText}>No entries yet this week</Text>
        </View>
      ) : (
        <View style={[styles.weekList, styles.fieldSpaced]}>
          {weeklyEntries.map((entry) => (
            <Pressable
              key={entry.id}
              style={styles.weekRow}
              onPress={() => setSelectedDate(new Date(entry.trade_date))}
            >
              <Text style={styles.weekDate}>
                {new Date(entry.trade_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text
                style={[
                  styles.weekPnl,
                  entry.profit_loss < 0 && styles.weekPnlNegative,
                ]}
              >
                {entry.profit_loss >= 0 ? '+' : ''}
                ${entry.profit_loss.toFixed(2)}
              </Text>
            </Pressable>
          ))}
        </View>
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
  pnlPillNegative: {
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  pnlText: {
    color: colors.accentGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  pnlTextNegative: {
    color: colors.accentRed,
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
  entryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 16,
  },
  entryDate: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  entryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  entryField: {
    flex: 1,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 12,
    marginTop: 10,
  },
  entryButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  entryButton: {
    flex: 1,
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
  weekList: {
    gap: 10,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  weekDate: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  weekPnl: {
    color: colors.accentGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  weekPnlNegative: {
    color: colors.accentRed,
  },
});
