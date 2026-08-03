import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LeaderboardParticipant, LeaderboardSettings } from '../types/database';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import AccentCard from '../components/AccentCard';
import GlassCard from '../components/GlassCard';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import PrizeTile from '../components/PrizeTile';
import LeaderboardRow from '../components/LeaderboardRow';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'Leaderboard'>;

const GOLD = colors.warning;
const SILVER = '#C4C9D4';
const BRONZE = '#D97B3F';

function rankColor(rank: number | null) {
  if (rank === 1) return GOLD;
  if (rank === 2) return SILVER;
  if (rank === 3) return BRONZE;
  return colors.textFaint;
}

export default function LeaderboardScreen({ navigation }: Props) {
  const { session } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();

  const [settings, setSettings] = useState<LeaderboardSettings | null>(null);
  const [participants, setParticipants] = useState<LeaderboardParticipant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [clientId, setClientId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    const [{ data: settingsData }, { data: participantData }] =
      await Promise.all([
        supabase.from('leaderboard_settings').select('*').limit(1).maybeSingle(),
        supabase
          .from('leaderboard_participants')
          .select('*')
          .eq('is_active', true)
          .order('rank', { ascending: true })
          .limit(20),
      ]);
    setSettings((settingsData as LeaderboardSettings) ?? null);
    setParticipants((participantData as LeaderboardParticipant[]) ?? []);
  }, []);

  useEffect(() => {
    fetchLeaderboard().then(() => setLoading(false));
  }, [fetchLeaderboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const currency = settings?.currency_symbol ?? 'R';
  const prize1 = settings?.prize_1st ?? 20000;
  const prize2 = settings?.prize_2nd ?? 7000;
  const prize3 = settings?.prize_3rd ?? 3000;
  const totalPool = prize1 + prize2 + prize3;

  const handleEnterChallenge = async () => {
    if (!session) return;
    if (!fullName.trim() || !nickname.trim() || !clientId.trim()) {
      setSubmitError('Please fill in all fields.');
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    const { error } = await supabase.from('leaderboard_participants').upsert(
      {
        user_id: session.user.id,
        name: fullName.trim(),
        nickname: nickname.trim(),
        mt5_number: clientId.trim(),
        is_active: true,
      },
      { onConflict: 'user_id' }
    );

    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
    } else {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <ScreenShell>
        <TopBar />
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.cardSpaced}
        />
      </ScreenShell>
    );
  }

  if (settings && settings.show_leaderboard === false) {
    return (
      <ScreenShell>
        <TopBar />
        <ScreenHeader
          icon="award"
          title="Leaderboard"
          subtitle="The leaderboard is currently inactive. Check back soon."
        />
      </ScreenShell>
    );
  }

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

      <ScreenHeader
        icon="award"
        title="Leaderboard"
        subtitle={`Challenge yourself with other traders and win your share of ${currency}${totalPool.toLocaleString()}`}
      />

      {settings?.show_podium !== false && (
        <AccentCard style={styles.cardSpaced}>
          <Text style={styles.heroTitle}>
            🏆 {settings?.competition_name ?? 'Enter The Millionaire League Challenge'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {settings?.banner_subtitle ??
              `Win your share of ${currency}${totalPool.toLocaleString()}`}
          </Text>

          <View style={styles.podiumRow}>
            <View style={styles.podiumColumn}>
              <Text style={styles.podiumEmoji}>🥈</Text>
              <View style={[styles.podiumBar, styles.podiumSilver]}>
                <Text style={styles.podiumNumber}>2</Text>
              </View>
            </View>
            <View style={styles.podiumColumn}>
              <Text style={styles.podiumEmojiLarge}>🏆</Text>
              <View
                style={[styles.podiumBar, styles.podiumGold, styles.podiumTall]}
              >
                <Text style={styles.podiumNumber}>1</Text>
              </View>
            </View>
            <View style={styles.podiumColumn}>
              <Text style={styles.podiumEmoji}>🥉</Text>
              <View style={[styles.podiumBar, styles.podiumBronze]}>
                <Text style={styles.podiumNumber}>3</Text>
              </View>
            </View>
          </View>
        </AccentCard>
      )}

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="award" size={18} color={colors.link} />
          <Text style={styles.sectionHeading}>Prize Breakdown</Text>
        </View>

        <View style={styles.prizeRow}>
          <PrizeTile
            icon="award"
            iconColor={GOLD}
            label="1ST PLACE"
            amount={`${currency}${prize1.toLocaleString()}`}
            amountColor={GOLD}
            backgroundColor="rgba(245,197,24,0.1)"
            borderColor="rgba(245,197,24,0.3)"
          />
          <PrizeTile
            icon="award"
            iconColor={SILVER}
            label="2ND PLACE"
            amount={`${currency}${prize2.toLocaleString()}`}
            amountColor={colors.text}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
          />
          <PrizeTile
            icon="award"
            iconColor={BRONZE}
            label="3RD PLACE"
            amount={`${currency}${prize3.toLocaleString()}`}
            amountColor={BRONZE}
            backgroundColor="rgba(217,123,63,0.1)"
            borderColor="rgba(217,123,63,0.3)"
          />
        </View>

        <Text style={styles.poolText}>
          Total monthly prize pool:{' '}
          <Text style={styles.poolAmount}>
            {currency}
            {totalPool.toLocaleString()}
          </Text>
        </Text>
      </GlassCard>

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="user" size={18} color={colors.link} />
          <Text style={styles.sectionHeading}>Join the Challenge</Text>
        </View>

        {submitted ? (
          <View style={styles.fieldSpaced}>
            <Text style={styles.successText}>
              You're entered! Your rank will appear on the leaderboard once
              trading activity is recorded.
            </Text>
          </View>
        ) : (
          <>
            <FormInput
              label="Full Name"
              icon="user"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              containerStyle={styles.fieldSpaced}
            />
            <FormInput
              label="Nickname"
              icon="user"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter your trading nickname"
              containerStyle={styles.fieldSpaced}
            />
            <FormInput
              label="PrimeXBT Client ID or MT5 Number"
              icon="hash"
              value={clientId}
              onChangeText={setClientId}
              placeholder="e.g. 1824763 or 1040834"
              keyboardType="number-pad"
              containerStyle={styles.fieldSpaced}
            />

            {submitError && (
              <Text style={styles.errorText}>{submitError}</Text>
            )}

            <PrimaryButton
              label={submitting ? 'Entering...' : 'Enter Challenge'}
              icon={null}
              variant="flat"
              disabled={submitting}
              onPress={handleEnterChallenge}
              style={styles.fieldSpaced}
            />
          </>
        )}
      </GlassCard>

      <Pressable
        style={[styles.rulesRow, styles.cardSpaced]}
        onPress={() => setRulesOpen((prev) => !prev)}
      >
        <View style={styles.rulesLeft}>
          <Feather name="info" size={18} color={colors.link} />
          <Text style={styles.rulesTitle}>Rules</Text>
        </View>
        <Feather
          name={rulesOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textFaint}
        />
      </Pressable>
      {rulesOpen && (
        <Text style={styles.rulesBody}>
          {settings?.rules ??
            'Full challenge terms coming soon — check back here for eligibility and judging details.'}
        </Text>
      )}

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="award" size={18} color={colors.link} />
          <Text style={styles.sectionHeading}>Top 20 Traders</Text>
        </View>

        <View style={styles.fieldSpaced}>
          {participants.map((participant) => {
            const badge =
              participant.previous_rank == null
                ? ({ type: 'new' } as const)
                : participant.rank != null &&
                    participant.rank < participant.previous_rank
                  ? ({
                      type: 'up',
                      amount: participant.previous_rank - participant.rank,
                    } as const)
                  : participant.rank != null &&
                      participant.rank > participant.previous_rank
                    ? ({
                        type: 'down',
                        amount: participant.rank - participant.previous_rank,
                      } as const)
                    : undefined;

            return (
              <LeaderboardRow
                key={participant.id}
                rankIconColor={rankColor(participant.rank)}
                name={participant.nickname || participant.name}
                subtitle={participant.name}
                lots={(participant.total_volume ?? 0).toFixed(2)}
                badge={badge}
              />
            );
          })}
          {participants.length === 0 && (
            <Text style={styles.emptyText}>
              No traders on the leaderboard yet.
            </Text>
          )}
        </View>
      </GlassCard>

      <DisclaimerCard style={styles.cardSpaced} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  cardSpaced: {
    marginTop: 20,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
    marginTop: 28,
  },
  podiumColumn: {
    alignItems: 'center',
  },
  podiumEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  podiumEmojiLarge: {
    fontSize: 40,
    marginBottom: 8,
  },
  podiumBar: {
    width: 72,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumTall: {
    height: 88,
  },
  podiumGold: {
    backgroundColor: GOLD,
  },
  podiumSilver: {
    backgroundColor: SILVER,
  },
  podiumBronze: {
    backgroundColor: BRONZE,
  },
  podiumNumber: {
    color: '#0A0D16',
    fontSize: 22,
    fontWeight: '800',
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
  prizeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  poolText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  poolAmount: {
    color: colors.link,
    fontWeight: '700',
  },
  fieldSpaced: {
    marginTop: 16,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  successText: {
    color: colors.accentGreen,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  rulesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadows.sm,
  },
  rulesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rulesTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rulesBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
