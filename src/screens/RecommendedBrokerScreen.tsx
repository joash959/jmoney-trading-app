import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { MoreStackParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import SurfaceCard from '../components/SurfaceCard';
import GradientLinkCard from '../components/GradientLinkCard';
import InsightCard from '../components/InsightCard';
import PrimaryButton from '../components/PrimaryButton';
import RatingCard from '../components/RatingCard';
import FeatureCard from '../components/FeatureCard';
import EmptyStateCard from '../components/EmptyStateCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';

type Props = NativeStackScreenProps<MoreStackParamList, 'RecommendedBroker'>;

const STATS = [
  { icon: 'time-outline' as const, value: '2018+', label: 'Operating Since' },
  { icon: 'trending-up-outline' as const, value: '100+', label: 'Markets' },
  { icon: 'flash-outline' as const, value: '1:1000', label: 'Max Leverage' },
  { icon: 'headset-outline' as const, value: '24/7', label: 'Support' },
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

const AFFILIATE_LINK =
  'https://go.primexbt.direct/visit/?bta=53738&brand=primexbt';

export default function RecommendedBrokerScreen({ navigation }: Props) {
  const { isPremium } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();
  const openAffiliateLink = () => Linking.openURL(AFFILIATE_LINK);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('feature_tier_settings')
      .select('default_tier')
      .eq('feature_key', 'recommended_broker')
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
          icon="briefcase-outline"
          image={require('../../assets/broker.png')}
          title="Recommended Broker"
        />
        <EmptyStateCard
          icon="lock-closed-outline"
          title="Premium Feature"
          subtitle="Connect and fund your PrimeXBT account to unlock this page."
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
        icon="briefcase-outline"
        image={require('../../assets/broker.png')}
        title="Recommended Broker"
      />

      <SurfaceCard style={styles.cardSpaced}>
        <View style={styles.brokerHeader}>
          <Image
            source={require('../../assets/broker.png')}
            style={styles.brokerLogo}
            resizeMode="contain"
          />
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
            <Ionicons name="trophy-outline" size={13} color={colors.textMuted} />
            <Text style={styles.badgeText}>Official Partner</Text>
          </View>
          <View style={styles.badgePill}>
            <Ionicons name="shield-outline" size={13} color={colors.textMuted} />
            <Text style={styles.badgeText}>Secure Platform</Text>
          </View>
        </View>
      </SurfaceCard>

      <GradientLinkCard
        title="Open a PrimeXBT Account"
        subtitle="Trade crypto, forex, indices & commodities"
        icon={require('../../assets/broker.png')}
        onPress={openAffiliateLink}
        style={styles.cardSpaced}
      />

      <View style={[styles.row, styles.cardSpaced]}>
        {STATS.slice(0, 2).map((stat) => (
          <InsightCard
            key={stat.label}
            variant="gradient"
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </View>
      <View style={[styles.row, styles.fieldSpaced]}>
        {STATS.slice(2, 4).map((stat) => (
          <InsightCard
            key={stat.label}
            variant="gradient"
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </View>

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
          icon="globe-outline"
          title="All-in-One Platform"
          description="Trade crypto, forex, indices and commodities from a single account."
        />
        <FeatureCard
          icon="bar-chart-outline"
          title="Advanced Charting"
          description="Professional TradingView charts and technical analysis tools."
        />
      </View>
      <FeatureCard
        icon="card-outline"
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

      <SurfaceCard style={[styles.cardSpaced, styles.ctaCard]}>
        <Ionicons name="globe-outline" size={30} color={colors.link} />
        <Text style={styles.ctaTitle}>Ready to Start Trading?</Text>
        <Text style={styles.ctaDescription}>
          Join thousands of active traders on PrimeXBT. Open your account
          today and start your trading journey.
        </Text>
        <PrimaryButton
          label="Open Live Account"
          icon="open-outline"
          onPress={openAffiliateLink}
          style={styles.fieldSpaced}
        />
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
