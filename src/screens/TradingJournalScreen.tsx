import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { TradeJournalEntry } from '../types/database';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import Calendar from '../components/Calendar';
import SectionLabel from '../components/SectionLabel';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import GlassCard from '../components/GlassCard';
import EmptyStateCard from '../components/EmptyStateCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';

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

export default function TradingJournalScreen({ navigation }: Props) {
  const { session, isPremium } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();
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
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('feature_tier_settings')
      .select('default_tier')
      .eq('feature_key', 'trading_journal')
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.default_tier === 'premium') {
          setLocked(!isPremium);
        }
        setCheckingAccess(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPremium]);

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

  if (checkingAccess) {
    return (
      <ScreenShell>
        <TopBar />
        <ActivityIndicator color={colors.accentBlue} style={styles.cardSpaced} />
      </ScreenShell>
    );
  }

  if (locked) {
    return (
      <ScreenShell>
        <TopBar
          rightElement={
            <NotificationBell
              count={unreadCount}
              onPress={() => navigation.navigate('Notifications')}
            />
          }
        />
        <ScreenHeader
          icon="bookmark"
          image={require('../../assets/tradingjournal.png')}
          title="Trading Journal"
        />
        <EmptyStateCard
          icon="lock"
          title="Premium Feature"
          subtitle="Connect and fund your PrimeXBT account to unlock the trading journal."
          buttonLabel="Connect PrimeXBT"
          onPress={connect.open}
          style={styles.cardSpaced}
        />
        <PrimeXBTConnectModal
          visible={connect.visible}
          onClose={connect.close}
          clientId={connect.clientId}
          onChangeClientId={connect.setClientId}
          onConnect={connect.handleConnect}
          loading={connect.loading}
          successMessage={connect.successMessage}
          errorMessage={connect.errorMessage}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <TopBar
        rightElement={
          <NotificationBell
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      <ScreenHeader
        icon="bookmark"
        image={require('../../assets/tradingjournal.png')}
        title="Trading Journal"
      />

      <LinearGradient
        colors={gradients.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.summaryCard, styles.cardSpaced]}
      >
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryIconCircle}>
            <Feather name="trending-up" size={20} color={colors.text} />
          </View>
          <View style={styles.daysPill}>
            <Text style={styles.daysText}>
              {monthlyEntries.length} day
              {monthlyEntries.length === 1 ? '' : 's'} logged
            </Text>
          </View>
        </View>
        <Text style={styles.summaryLabel}>Monthly P&L</Text>
        <Text
          style={[
            styles.summaryValue,
            monthlyPnl < 0 && styles.summaryValueNegative,
          ]}
        >
          {monthlyPnl >= 0 ? '+$' : '-$'}
          {Math.abs(monthlyPnl).toFixed(2)}
        </Text>
      </LinearGradient>

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

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="edit-3" size={18} color={colors.link} />
          <Text style={styles.sectionHeading}>Log Entry</Text>
        </View>
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
      </GlassCard>

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
              <View style={styles.weekLeft}>
                <View
                  style={[
                    styles.weekIndicator,
                    entry.profit_loss < 0 && styles.weekIndicatorNegative,
                  ]}
                >
                  <Feather
                    name={entry.profit_loss < 0 ? 'arrow-down-right' : 'arrow-up-right'}
                    size={13}
                    color={entry.profit_loss < 0 ? colors.accentRed : colors.accentGreen}
                  />
                </View>
                <Text style={styles.weekDate}>
                  {new Date(entry.trade_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
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
  cardSpaced: {
    marginTop: 20,
  },
  summaryCard: {
    borderRadius: radius.xl,
    padding: 18,
    ...shadows.glow,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryValueNegative: {
    color: '#FFD7D7',
  },
  daysPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  daysText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldSpaced: {
    marginTop: 12,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  entryDate: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
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
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    ...shadows.sm,
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
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadows.sm,
  },
  weekLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekIndicator: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: 'rgba(37,211,102,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekIndicatorNegative: {
    backgroundColor: 'rgba(239,68,68,0.15)',
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
