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
import PageHeader from '../components/PageHeader';
import NotificationBell from '../components/NotificationBell';
import SurfaceCard from '../components/SurfaceCard';
import PrimaryButton from '../components/PrimaryButton';
import EmptyStateCard from '../components/EmptyStateCard';
import Icon3D, { Icon3DName } from '../components/Icon3D';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';

type Props = NativeStackScreenProps<MoreStackParamList, 'RecommendedBroker'>;

const STATS = [
  { value: '2018', label: 'Founded' },
  { value: '100+', label: 'Markets' },
  { value: '1:1000', label: 'Max leverage' },
  { value: '24/7', label: 'Support' },
];

const RATINGS = [
  { name: 'Trustpilot', rating: '4.5' },
  { name: 'Google', rating: '4.4' },
  { name: 'TradingView', rating: '4.2' },
];

const MARKETS: { icon: Icon3DName; title: string; description: string }[] = [
  { icon: 'gem', title: 'Crypto', description: 'BTC, ETH & more' },
  { icon: 'bank', title: 'Forex', description: 'Majors & minors' },
  { icon: 'chart-up', title: 'Indices', description: 'US, EU & Asia' },
  { icon: 'money-bag', title: 'Commodities', description: 'Gold, oil & more' },
];

const REASONS = [
  'Crypto, forex, indices and commodities in one account',
  'Professional TradingView charts and analysis tools',
  'Fund with crypto, card or local payment methods',
  'Trade on the web, the PrimeXBT app or MetaTrader 5',
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
        <PageHeader title="Broker" onBack={() => navigation.goBack()} />
        <ActivityIndicator color={colors.accentBlue} style={styles.cardSpaced} />
      </ScreenShell>
    );
  }

  if (locked) {
    return (
      <ScreenShell>
        <PageHeader
          title="Broker"
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
      <PageHeader
        title="Broker"
        onBack={() => navigation.goBack()}
        context="PrimeXBT · crypto, forex, indices & commodities"
        right={
          <NotificationBell
            plain
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      {/* The broker at a glance: who, key numbers, and the one action. */}
      <SurfaceCard style={styles.cardSpaced}>
        <View style={styles.brokerHeader}>
          <Image
            source={require('../../assets/broker.png')}
            style={styles.brokerLogo}
            resizeMode="contain"
          />
          <View style={styles.brokerHeaderText}>
            <Text style={styles.brokerName}>PrimeXBT</Text>
            <View style={styles.partnerRow}>
              <Ionicons name="shield-checkmark" size={14} color={colors.accentGreen} />
              <Text style={styles.partnerText}>Official JMONEY partner</Text>
            </View>
          </View>
        </View>

        <Text style={styles.brokerDescription}>
          Trade crypto, forex, indices and commodities with powerful tools and
          competitive conditions.
        </Text>

        <View style={styles.statsRow}>
          {STATS.map((stat, i) => (
            <View key={stat.label} style={[styles.stat, i > 0 && styles.statDivider]}>
              <Text numeric style={styles.statValue}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton
          label="Open a PrimeXBT account"
          icon="open-outline"
          onPress={openAffiliateLink}
          style={styles.cardSpaced}
        />
      </SurfaceCard>

      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>Rated by traders</Text>
      <SurfaceCard style={[styles.fieldSpaced, styles.ratingsCard]}>
        {RATINGS.map((r, i) => (
          <View key={r.name} style={[styles.rating, i > 0 && styles.statDivider]}>
            <View style={styles.ratingValueRow}>
              <Ionicons name="star" size={15} color={colors.warning} />
              <Text numeric style={styles.ratingValue}>
                {r.rating}
              </Text>
            </View>
            <Text style={styles.statLabel}>{r.name}</Text>
          </View>
        ))}
      </SurfaceCard>

      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>What you can trade</Text>
      <SurfaceCard style={styles.fieldSpaced}>
        <View style={styles.marketGrid}>
          {MARKETS.map((m) => (
            <View key={m.title} style={styles.market}>
              <Icon3D name={m.icon} size={34} />
              <View style={styles.marketText}>
                <Text style={styles.marketTitle}>{m.title}</Text>
                <Text style={styles.marketDescription} numberOfLines={1}>
                  {m.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>Why PrimeXBT</Text>
      <SurfaceCard style={styles.fieldSpaced}>
        {REASONS.map((reason, i) => (
          <View key={reason} style={[styles.reason, i > 0 && styles.reasonDivider]}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={14} color={colors.accentGreen} />
            </View>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </SurfaceCard>

      <PrimaryButton
        label="Open live account"
        icon="open-outline"
        onPress={openAffiliateLink}
        style={styles.sectionSpaced}
      />
      <Text style={styles.footnote}>
        Trading involves risk. Only trade what you can afford to lose.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  cardSpaced: {
    marginTop: 20,
  },
  fieldSpaced: {
    marginTop: 12,
  },
  sectionSpaced: {
    marginTop: 28,
  },
  brokerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brokerLogo: {
    width: 56,
    height: 56,
  },
  brokerHeaderText: {
    flex: 1,
  },
  brokerName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  partnerText: {
    color: colors.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  brokerDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.glassTile,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.divider,
  },
  statValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  ratingsCard: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  rating: {
    flex: 1,
    alignItems: 'center',
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  market: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  marketText: {
    flex: 1,
  },
  marketTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  marketDescription: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 1,
  },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  reasonDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(46,230,166,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  footnote: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
