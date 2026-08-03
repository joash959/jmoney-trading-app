import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InsightCard from '../components/InsightCard';
import EmptyStateCard from '../components/EmptyStateCard';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

export default function LiveScreen() {
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
          <Feather name="video" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Live Sessions</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Join upcoming live trading sessions and webinars.
      </Text>

      <View style={styles.statsRow}>
        <InsightCard icon="calendar" label="This Week" value="0" />
        <InsightCard
          icon="clock"
          iconColor={colors.accentGreen}
          label="Next Session"
          value="None"
          valueColor={colors.accentGreen}
        />
      </View>

      <EmptyStateCard
        icon="video"
        iconVariant="plain"
        title="No Upcoming Sessions"
        subtitle="Check back later for new live trading sessions."
        style={styles.cardSpaced}
      />

      <DisclaimerCard style={styles.cardSpaced} />
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cardSpaced: {
    marginTop: 20,
  },
});
