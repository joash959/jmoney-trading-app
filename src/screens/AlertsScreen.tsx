import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InsightCard from '../components/InsightCard';
import AlertCard from '../components/AlertCard';
import FloatingChatButton from '../components/FloatingChatButton';

type TradeAlert = {
  id: string;
  message: string;
  created_at: string;
};

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `about ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);
  const [longCount, setLongCount] = useState(0);
  const [shortCount, setShortCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [{ data: alertData, error: alertError }, { data: signalData }] =
        await Promise.all([
          supabase
            .from('trade_alerts')
            .select('id, message, created_at')
            .order('created_at', { ascending: false })
            .limit(30),
          supabase
            .from('trading_signals')
            .select('signal_type')
            .gte(
              'created_at',
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            ),
        ]);

      if (cancelled) return;

      if (alertError) {
        setError(alertError.message);
        setLoading(false);
        return;
      }

      setAlerts((alertData as TradeAlert[]) ?? []);

      let long = 0;
      let short = 0;
      (signalData ?? []).forEach((row: any) => {
        const type = (row.signal_type ?? '').toLowerCase();
        if (type.includes('buy') || type.includes('long')) long += 1;
        else if (type.includes('sell') || type.includes('short')) short += 1;
      });
      setLongCount(long);
      setShortCount(short);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const todayCount = alerts.filter((alert) => {
    const created = new Date(alert.created_at);
    const now = new Date();
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate()
    );
  }).length;

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
          <Feather name="bell" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Trade Alerts</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{alerts.length}</Text>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>
        Real-time Trade Alert Insights with JMONEY
      </Text>

      {loading ? (
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.fieldSpaced}
        />
      ) : error ? (
        <Text style={[styles.errorText, styles.fieldSpaced]}>
          Couldn't load alerts: {error}
        </Text>
      ) : (
        <>
          <View style={styles.statsRow}>
            <InsightCard
              icon="activity"
              label="Today"
              value={String(todayCount)}
              sublabel="Market Alert Insights"
            />
            <InsightCard
              icon="trending-up"
              iconColor={colors.accentGreen}
              label="Long"
              value={String(longCount)}
              valueColor={colors.accentGreen}
              sublabel="Insights"
            />
          </View>
          <View style={[styles.statsRow, styles.fieldSpaced]}>
            <InsightCard
              icon="trending-down"
              iconColor={colors.accentRed}
              label="Short"
              value={String(shortCount)}
              valueColor={colors.accentRed}
              sublabel="Insights"
            />
            <InsightCard
              icon="clock"
              label="Last Alert"
              value={alerts[0] ? formatRelativeTime(alerts[0].created_at) : '—'}
              sublabel="most recent"
            />
          </View>

          <View style={[styles.sectionHeaderRow, styles.sectionSpaced]}>
            <Feather name="clock" size={16} color={colors.text} />
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
          </View>

          <View style={styles.list}>
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                relativeTime={formatRelativeTime(alert.created_at)}
                message={alert.message}
                timestamp={formatTimestamp(alert.created_at)}
              />
            ))}
            {alerts.length === 0 && (
              <Text style={styles.emptyText}>No alerts yet.</Text>
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
  countPill: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  fieldSpaced: {
    marginTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionSpaced: {
    marginTop: 28,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  list: {
    gap: 14,
    marginTop: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
