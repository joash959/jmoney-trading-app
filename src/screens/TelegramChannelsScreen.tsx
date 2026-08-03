import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { toFeatherIcon } from '../lib/icons';
import { parseFunctionError } from '../lib/functionError';
import { Community, TelegramAccessStatus } from '../types/database';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import AccentCard from '../components/AccentCard';
import GlassCard from '../components/GlassCard';
import Pill from '../components/Pill';
import PrimaryButton from '../components/PrimaryButton';
import ChannelCard from '../components/ChannelCard';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'TelegramChannels'>;

const REASON_TEXT: Record<string, string> = {
  not_funded:
    'Connect and fund your PrimeXBT account (minimum R500) on the Home tab to unlock this channel.',
  not_approved: 'Your account is pending approval.',
  expired: 'Your access has expired. Fund your account to restore it.',
  eligible_removed:
    'You were removed from the channel, but you\'re eligible to rejoin.',
  not_joined: 'You haven\'t joined the channel yet.',
};

export default function TelegramChannelsScreen({ navigation }: Props) {
  const { count: unreadCount } = useUnreadNotificationsCount();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [status, setStatus] = useState<TelegramAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    const { data } = await supabase.functions.invoke('telegram-access', {
      body: { action: 'status' },
    });
    setStatus((data as TelegramAccessStatus) ?? null);
  }, []);

  const fetchAll = useCallback(async () => {
    const [{ data }] = await Promise.all([
      supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      fetchStatus(),
    ]);
    setCommunities((data as Community[]) ?? []);
  }, [fetchStatus]);

  useEffect(() => {
    fetchAll().then(() => setLoading(false));
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleAction = async (action: 'start_link' | 'self_invite') => {
    setActionError(null);
    setActionLoading(true);
    const { data, error } = await supabase.functions.invoke('telegram-access', {
      body: { action },
    });
    setActionLoading(false);

    if (error) {
      setActionError(await parseFunctionError(error));
      return;
    }

    const url = data?.url ?? data?.invite;
    if (url) Linking.openURL(url);
    fetchStatus();
  };

  const joined = status?.link?.status === 'joined' && status?.link?.in_channel;

  return (
    <ScreenShell
      overlay={<FloatingChatButton />}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <TopBar
        rightElement={
          <NotificationBell
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Feather name="sliders" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Telegram Channels</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Join our Telegram channels for Trade Alerts.
      </Text>

      {loading ? (
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.cardSpaced}
        />
      ) : (
        <AccentCard style={styles.cardSpaced}>
          <View style={styles.privateHeaderRow}>
            <View style={styles.privateTitleRow}>
              <Feather name="send" size={18} color={colors.link} />
              <Text style={styles.privateTitle}>Private members channel</Text>
            </View>
            <Pill
              label={
                status?.canRecover
                  ? 'Ready to restore'
                  : joined
                    ? 'Active'
                    : status?.accessActive
                      ? 'Unlocked'
                      : 'Locked'
              }
              color={
                joined || status?.accessActive
                  ? colors.accentGreen
                  : colors.link
              }
            />
          </View>
          <Text style={styles.description}>
            Live trade alerts and mentorship on Telegram — for funded members
            only.
          </Text>

          {!status?.accessActive && status?.reason && (
            <Text style={styles.reasonText}>
              {REASON_TEXT[status.reason] ?? 'This channel isn\'t unlocked yet.'}
            </Text>
          )}

          {joined ? (
            <View style={styles.joinedRow}>
              <Feather name="check" size={16} color={colors.accentGreen} />
              <Text style={styles.joinedText}>You're in the channel</Text>
            </View>
          ) : (
            status?.accessActive && (
              <PrimaryButton
                label={
                  actionLoading
                    ? 'Please wait...'
                    : status.canRecover
                      ? 'Restore access'
                      : !status.link
                        ? 'Start on Telegram'
                        : 'Join via Telegram bot'
                }
                icon="refresh-cw"
                variant="flat"
                disabled={actionLoading}
                onPress={() =>
                  handleAction(status.link ? 'self_invite' : 'start_link')
                }
                style={styles.fieldSpaced}
              />
            )
          )}

          {actionError && (
            <Text style={styles.errorText}>{actionError}</Text>
          )}
        </AccentCard>
      )}

      {communities.map((community) => (
        <ChannelCard
          key={community.id}
          icon={toFeatherIcon(community.icon_name)}
          title={community.name}
          tagLabel={community.category}
          tagColor={colors.link}
          tagBackground={colors.accentBlueDim}
          description={community.description ?? ''}
          members={community.member_count ?? ''}
          featured={community.tier === 'premium'}
          onJoinPress={() => Linking.openURL(community.telegram_link)}
        />
      ))}

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

      <DisclaimerCard style={styles.cardSpaced} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  privateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  privateTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  reasonText: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  fieldSpaced: {
    marginTop: 18,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  joinedText: {
    color: colors.accentGreen,
    fontSize: 14,
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
