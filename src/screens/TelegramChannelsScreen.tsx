import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { toFeatherIcon } from '../lib/icons';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { Community } from '../types/database';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import ChannelCard from '../components/ChannelCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';

type Props = NativeStackScreenProps<MoreStackParamList, 'TelegramChannels'>;

const CATEGORY_ACCENTS = [
  { bg: 'rgba(47,111,239,0.15)', fg: colors.link },
  { bg: 'rgba(139,124,255,0.15)', fg: colors.accentPurple },
  { bg: 'rgba(37,211,102,0.15)', fg: colors.accentGreen },
  { bg: 'rgba(34,211,238,0.15)', fg: '#22D3EE' },
  { bg: 'rgba(245,197,24,0.15)', fg: colors.warning },
];

function categoryAccent(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_ACCENTS[hash % CATEGORY_ACCENTS.length];
}

export default function TelegramChannelsScreen({ navigation }: Props) {
  const { isPremium } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from('communities')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    setCommunities((data as Community[]) ?? []);
  }, []);

  useEffect(() => {
    fetchAll().then(() => setLoading(false));
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const { featured, rest } = useMemo(() => {
    const premiumIndex = communities.findIndex((c) => c.tier === 'premium');
    if (premiumIndex === -1) {
      return { featured: null as Community | null, rest: communities };
    }
    const featuredCommunity = communities[premiumIndex];
    const others = communities.filter((_, i) => i !== premiumIndex);
    return { featured: featuredCommunity, rest: others };
  }, [communities]);

  const openCommunity = (community: Community) => {
    if (community.tier === 'premium' && !isPremium) {
      connect.open();
      return;
    }
    Linking.openURL(community.telegram_link);
  };

  return (
    <ScreenShell refreshing={refreshing} onRefresh={handleRefresh}>
      <TopBar
        rightElement={
          <NotificationBell
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      <ScreenHeader
        icon="sliders"
        image={require('../../assets/telegram.png')}
        title="Telegram Channels"
      />

      {loading ? (
        <ActivityIndicator color={colors.accentBlue} style={styles.cardSpaced} />
      ) : (
        <>
          {featured && (
            <Pressable
              onPress={() => openCommunity(featured)}
              style={({ pressed }) => [styles.cardSpaced, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featuredCard}
              >
                <View style={styles.featuredTopRow}>
                  <View style={styles.featuredIconCircle}>
                    <Feather
                      name={toFeatherIcon(featured.icon_name)}
                      size={20}
                      color={colors.text}
                    />
                  </View>
                  <View style={styles.featuredBadge}>
                    <Feather
                      name={isPremium ? 'unlock' : 'lock'}
                      size={11}
                      color={colors.text}
                    />
                    <Text style={styles.featuredBadgeText}>
                      {isPremium ? 'Unlocked' : 'Premium'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.featuredTitle}>{featured.name}</Text>
                <Text style={styles.featuredDescription}>
                  {featured.description ??
                    'Live trade alerts and mentorship, for premium members only.'}
                </Text>

                <View style={styles.featuredMembersRow}>
                  <Feather name="users" size={13} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.featuredMembersText}>
                    {featured.member_count ?? '—'} members
                  </Text>
                </View>

                <View style={styles.featuredCta}>
                  <Text style={styles.featuredCtaText}>
                    {isPremium ? 'Join Channel' : 'Unlock with Premium'}
                  </Text>
                  <Feather
                    name={isPremium ? 'arrow-right' : 'lock'}
                    size={15}
                    color={colors.accentBlue}
                  />
                </View>
              </LinearGradient>
            </Pressable>
          )}

          {rest.length > 0 && (
            <View style={[styles.sectionHeaderRow, styles.sectionSpaced]}>
              <Text style={styles.sectionTitle}>All Channels</Text>
              <Text style={styles.sectionCount}>{rest.length}</Text>
            </View>
          )}

          {rest.map((community) => {
            const accent = categoryAccent(community.category);
            return (
              <ChannelCard
                key={community.id}
                icon={toFeatherIcon(community.icon_name)}
                iconColor={accent.fg}
                iconBackground={accent.bg}
                title={community.name}
                tagLabel={community.category}
                tagColor={accent.fg}
                tagBackground={accent.bg}
                description={community.description ?? ''}
                members={community.member_count ?? ''}
                locked={community.tier === 'premium' && !isPremium}
                onJoinPress={() => openCommunity(community)}
              />
            );
          })}

          <GlassCard style={styles.cardSpaced}>
            <View style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Feather name="message-circle" size={18} color={colors.link} />
              </View>
              <View style={styles.tipBody}>
                <Text style={styles.tipTitle}>New to Telegram?</Text>
                <Text style={styles.tipDescription}>
                  Download the Telegram app on your phone or desktop, then tap
                  any community above to join. It's free and takes just a few
                  seconds to get started!
                </Text>
              </View>
            </View>
          </GlassCard>
        </>
      )}

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

const styles = StyleSheet.create({
  cardSpaced: {
    marginTop: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  featuredCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.glow,
  },
  featuredTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featuredBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 14,
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  featuredMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  featuredMembersText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  featuredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.text,
    borderRadius: radius.pill,
    height: 46,
    marginTop: 16,
  },
  featuredCtaText: {
    color: colors.accentBlue,
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionSpaced: {
    marginTop: 28,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCount: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '700',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 14,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(47,111,239,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  tipDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
