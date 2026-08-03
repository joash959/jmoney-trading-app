import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InsightCard from '../components/InsightCard';
import AlertCard from '../components/AlertCard';
import FloatingChatButton from '../components/FloatingChatButton';

const ALERTS = [
  {
    relativeTime: '6 minutes ago',
    message: '3:30PM',
    timestamp: 'Aug 3, 2026, 2:26:39 PM',
  },
  {
    relativeTime: '6 minutes ago',
    message: 'My next trade will be at THE NYSE OPEN',
    timestamp: 'Aug 3, 2026, 2:26:33 PM',
  },
  {
    relativeTime: 'about 3 hours ago',
    message: 'Good morning',
    timestamp: 'Aug 3, 2026, 11:39:16 AM',
  },
  {
    relativeTime: 'about 3 hours ago',
    message: '600+ PIPS THERE',
    timestamp: 'Aug 3, 2026, 11:36:20 AM',
  },
  {
    relativeTime: 'about 3 hours ago',
    message: 'WE KILLED IT',
    timestamp: 'Aug 3, 2026, 11:36:06 AM',
  },
];

export default function AlertsScreen() {
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
          <Text style={styles.countText}>13</Text>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>
        Real-time Trade Alert Insights with JMONEY
      </Text>

      <View style={styles.statsRow}>
        <InsightCard
          icon="activity"
          label="Today"
          value="1"
          sublabel="Market Alert Insights"
        />
        <InsightCard
          icon="trending-up"
          iconColor={colors.accentGreen}
          label="Long"
          value="0"
          valueColor={colors.accentGreen}
          sublabel="Insights"
        />
      </View>
      <View style={[styles.statsRow, styles.fieldSpaced]}>
        <InsightCard
          icon="trending-down"
          iconColor={colors.accentRed}
          label="Short"
          value="1"
          valueColor={colors.accentRed}
          sublabel="Insights"
        />
        <InsightCard
          icon="clock"
          label="Last Alert"
          value="6 minutes ago"
          sublabel="most recent"
        />
      </View>

      <View style={[styles.sectionHeaderRow, styles.sectionSpaced]}>
        <Feather name="clock" size={16} color={colors.text} />
        <Text style={styles.sectionTitle}>Recent Alerts</Text>
      </View>

      <View style={styles.list}>
        {ALERTS.map((alert) => (
          <AlertCard key={alert.timestamp} {...alert} />
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
});
