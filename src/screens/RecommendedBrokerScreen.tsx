import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import BackButton from '../components/BackButton';
import AccentCard from '../components/AccentCard';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import RatingCard from '../components/RatingCard';
import FeatureCard from '../components/FeatureCard';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<RootStackParamList, 'RecommendedBroker'>;

const STATS = [
  { icon: 'clock' as const, value: '2018+', label: 'Operating Since' },
  { icon: 'trending-up' as const, value: '100+', label: 'Markets' },
  { icon: 'zap' as const, value: 'Up to 1:1000', label: 'Leverage' },
  { icon: 'headphones' as const, value: '24/7', label: 'Support' },
];

const RATINGS = [
  { name: 'Trustpilot', rating: '4.5/5' },
  { name: 'Google Reviews', rating: '4.4/5' },
  { name: 'TradingView', rating: '4.2/5' },
];

const ASSET_CLASSES = [
  { title: 'Crypto', description: 'Bitcoin, Ethereum, altcoins & more' },
  { title: 'Forex', description: 'Major, minor and exotic pairs' },
  { title: 'Indices', description: 'US, Europe and Asia stock indices' },
  { title: 'Commodities', description: 'Gold, oil, silver and energies' },
];

export default function RecommendedBrokerScreen({ navigation }: Props) {
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
          <Feather name="briefcase" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Recommended Broker</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Our trusted partner for your trading journey.
      </Text>

      <AccentCard style={styles.cardSpaced}>
        <View style={styles.brokerHeader}>
          <View style={styles.brokerLogo}>
            <Text style={styles.brokerLogoText}>PX</Text>
          </View>
          <View style={styles.brokerHeaderText}>
            <Text style={styles.brokerName}>PrimeXBT Trading Broker</Text>
            <Text style={styles.brokerTagline}>
              Premium conditions for active traders
            </Text>
          </View>
        </View>

        <Text style={styles.brokerDescription}>
          Trade crypto, forex, indices and commodities with powerful tools
          and competitive conditions.
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Feather name="award" size={13} color={colors.textMuted} />
            <Text style={styles.badgeText}>Official Partner</Text>
          </View>
          <View style={styles.badgePill}>
            <Feather name="shield" size={13} color={colors.textMuted} />
            <Text style={styles.badgeText}>Secure Platform</Text>
          </View>
        </View>

        <PrimaryButton
          label="Start Trading"
          icon="external-link"
          variant="flat"
          style={styles.fieldSpaced}
        />
        <SecondaryButton label="Visit PrimeXBT" style={styles.fieldSpaced} />
      </AccentCard>

      <GlassCard style={[styles.cardSpaced, styles.statsCard]}>
        <View style={styles.statsRow}>
          {STATS.slice(0, 2).map((stat, i) => (
            <View
              key={stat.label}
              style={[styles.statCell, i === 0 && styles.statCellBorder]}
            >
              <Feather name={stat.icon} size={20} color={colors.link} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.statsRow, styles.statsRowBorder]}>
          {STATS.slice(2, 4).map((stat, i) => (
            <View
              key={stat.label}
              style={[styles.statCell, i === 0 && styles.statCellBorder]}
            >
              <Feather name={stat.icon} size={20} color={colors.link} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
        Trusted by Traders Worldwide
      </Text>
      <View style={[styles.row, styles.fieldSpaced]}>
        {RATINGS.map((r) => (
          <RatingCard key={r.name} name={r.name} rating={r.rating} />
        ))}
      </View>

      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
        Why Choose PrimeXBT?
      </Text>
      <View style={[styles.row, styles.fieldSpaced]}>
        <FeatureCard
          icon="globe"
          title="All-in-One Platform"
          description="Trade crypto, forex, indices and commodities from a single account."
        />
        <FeatureCard
          icon="bar-chart-2"
          title="Advanced Charting"
          description="Professional TradingView charts and technical analysis tools."
          featured
        />
      </View>
      <FeatureCard
        icon="credit-card"
        title="Easy Funding"
        description="Fund via crypto, card, or local payment methods quickly."
        style={styles.fieldSpaced}
      />

      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
        100+ Trading Opportunities
      </Text>
      <View style={[styles.row, styles.fieldSpaced]}>
        <FeatureCard
          title={ASSET_CLASSES[0].title}
          description={ASSET_CLASSES[0].description}
          align="center"
        />
        <FeatureCard
          title={ASSET_CLASSES[1].title}
          description={ASSET_CLASSES[1].description}
          align="center"
        />
      </View>
      <View style={[styles.row, styles.fieldSpaced]}>
        <FeatureCard
          title={ASSET_CLASSES[2].title}
          description={ASSET_CLASSES[2].description}
          align="center"
        />
        <FeatureCard
          title={ASSET_CLASSES[3].title}
          description={ASSET_CLASSES[3].description}
          align="center"
        />
      </View>

      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
        Trading Platforms
      </Text>
      <View style={[styles.row, styles.fieldSpaced]}>
        <FeatureCard
          title="PrimeXBT Web"
          description="Full-featured trading from your browser"
        />
        <FeatureCard
          title="PrimeXBT Mobile App"
          description="Trade and manage positions on the go"
        />
      </View>
      <FeatureCard
        title="MetaTrader 5"
        description="Advanced charting and automated trading"
        style={styles.fieldSpaced}
      />

      <GlassCard style={[styles.cardSpaced, styles.ctaCard]}>
        <Feather name="globe" size={30} color={colors.link} />
        <Text style={styles.ctaTitle}>Ready to Start Trading?</Text>
        <Text style={styles.ctaDescription}>
          Join thousands of active traders on PrimeXBT. Open your account
          today and start your trading journey.
        </Text>
        <PrimaryButton
          label="Open Live Account"
          icon="external-link"
          variant="flat"
          style={styles.fieldSpaced}
        />
        <SecondaryButton
          label="Visit PrimeXBT Website"
          icon="external-link"
          style={styles.fieldSpaced}
        />
      </GlassCard>

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
    fontSize: 20,
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
  brokerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brokerLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brokerLogoText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  brokerHeaderText: {
    flex: 1,
  },
  brokerName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  brokerTagline: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  brokerDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  fieldSpaced: {
    marginTop: 14,
  },
  statsCard: {
    padding: 0,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statCellBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSpaced: {
    marginTop: 28,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  ctaTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 12,
  },
  ctaDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
});
