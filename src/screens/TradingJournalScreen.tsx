import { useRef, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { TradeJournalEntry } from '../types/database';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import SectionHeader from '../components/SectionHeader';
import LineChart from '../components/LineChart';
import PageHeader from '../components/PageHeader';
import NotificationBell from '../components/NotificationBell';
import Calendar from '../components/Calendar';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import GlassCard from '../components/GlassCard';
import EmptyStateCard from '../components/EmptyStateCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import XpToast, { XpToastHandle } from '../components/XpToast';
import { XP } from '../lib/gamification';

type Props = NativeStackScreenProps<MoreStackParamList, 'TradingJournal'>;

const today = new Date();

function toDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "+$1,400.00" / "-$150.00" - sign before the currency symbol, with separators. */
function formatPnl(value: number) {
  const amount = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? '-' : '+'}$${amount}`;
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

  const xpToast = useRef<XpToastHandle>(null);

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
    // Reward a new day logged (not edits) - mirrors lib/gamification XP.
    if (!selectedEntry) {
      xpToast.current?.show(
        XP.journalEntry + (pnl > 0 ? XP.greenDay : 0),
        pnl > 0 ? 'Green day!' : 'Day logged'
      );
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
  // Running total through the month, oldest day first, for the chart.
  const monthSeries = [...monthlyEntries]
    .sort((a, b) => a.trade_date.localeCompare(b.trade_date))
    .reduce<{ label: string; value: number }[]>(
      (points, e) => [
        ...points,
        { label: e.trade_date, value: points[points.length - 1].value + e.profit_loss },
      ],
      [{ label: 'start', value: 0 }]
    );

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
        <PageHeader title="Trading journal" onBack={() => navigation.goBack()} />
        <ActivityIndicator color={colors.accentBlue} style={styles.cardSpaced} />
      </ScreenShell>
    );
  }

  if (locked) {
    return (
      <ScreenShell>
        <PageHeader
          title="Trading journal"
          onBack={() => navigation.goBack()}
          right={
            <NotificationBell
              plain
              count={unreadCount}
              onPress={() => navigation.navigate('Notifications')}
            />
          }
        />
        <EmptyStateCard
          icon="lock-closed-outline"
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
    <ScreenShell overlay={<XpToast ref={xpToast} />}>
      <PageHeader
        title="Trading journal"
        onBack={() => navigation.goBack()}
        context={`${monthlyEntries.length} day${monthlyEntries.length === 1 ? '' : 's'} logged this month`}
        right={
          <NotificationBell
            plain
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      <View style={[styles.summaryCard, styles.cardSpaced]}>
        <View style={styles.summaryTopRow}>
          <Text style={styles.summaryLabel}>Monthly P&L</Text>
        </View>
        <Text
          numeric
          style={[
            styles.summaryValue,
            monthlyPnl < 0 && styles.summaryValueNegative,
          ]}
        >
          {formatPnl(monthlyPnl)}
        </Text>
        <LineChart data={monthSeries} height={110} style={styles.summaryChart} />
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

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Ionicons name="create-outline" size={18} color={colors.link} />
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
              icon="trash-outline"
              onPress={handleDelete}
            />
          )}
        </View>
      </GlassCard>

      <SectionHeader title="This week" />
      {weeklyEntries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No entries yet this week</Text>
        </View>
      ) : (
        <View style={styles.weekList}>
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
                  <Ionicons
                    name={entry.profit_loss < 0 ? 'trending-down-outline' : 'trending-up-outline'}
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
                numeric
                style={[
                  styles.weekPnl,
                  entry.profit_loss < 0 && styles.weekPnlNegative,
                ]}
              >
                {formatPnl(entry.profit_loss)}
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
    borderRadius: radius['2xl'],
    padding: 20,
    paddingBottom: 8,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  summaryChart: {
    marginTop: 8,
    marginHorizontal: -20,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 48,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryValueNegative: {
    color: colors.accentRed,
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
    backgroundColor: 'rgba(46,230,166,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekIndicatorNegative: {
    backgroundColor: 'rgba(255,77,106,0.15)',
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
