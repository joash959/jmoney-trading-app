import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { LiveSession } from '../types/database';
import { MainTabParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import InsightCard from '../components/InsightCard';
import EmptyStateCard from '../components/EmptyStateCard';
import PrimaryButton from '../components/PrimaryButton';
import Skeleton from '../components/Skeleton';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';

function formatSessionDate(dateStr: string, timeStr: string | null) {
  const date = new Date(`${dateStr}T${timeStr ?? '00:00:00'}`);
  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (!timeStr) return dateLabel;
  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${dateLabel} • ${timeLabel}`;
}

function formatDateOnly(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type Props = BottomTabScreenProps<MainTabParamList, 'Live'>;

export default function LiveScreen({ navigation }: Props) {
  const { isPremium: hasPremiumAccess } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Section-wide default from the admin panel - a session is locked if
  // EITHER it's individually marked premium OR the whole section defaults
  // to premium, so nothing slips through as free just because an item was
  // never explicitly marked after the section default changed.
  const [sectionPremium, setSectionPremium] = useState(false);

  useEffect(() => {
    supabase
      .from('feature_tier_settings')
      .select('default_tier')
      .eq('feature_key', 'live_sessions')
      .maybeSingle()
      .then(({ data, error: settingsError }) => {
        if (!settingsError && data?.default_tier === 'premium') {
          setSectionPremium(true);
        }
      });
  }, []);

  const fetchSessions = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('is_active', true)
      .order('session_date', { ascending: true })
      .order('session_time', { ascending: true });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setSessions((data as LiveSession[]) ?? []);
    }
  }, []);

  useEffect(() => {
    fetchSessions().then(() => setLoading(false));
  }, [fetchSessions]);

  useEffect(() => {
    const channel = supabase
      .channel('live_sessions_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_sessions' },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const handleCopyPassword = async (session: LiveSession) => {
    if (!session.zoom_password) return;
    await Clipboard.setStringAsync(session.zoom_password);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedId(session.id);
    setTimeout(() => setCopiedId((current) => (current === session.id ? null : current)), 1500);
  };

  const now = new Date();
  const upcoming = sessions.filter(
    (session) => new Date(`${session.session_date}T${session.session_time ?? '23:59:59'}`) >= now
  );

  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = upcoming.filter(
    (session) => new Date(session.session_date) <= oneWeekFromNow
  ).length;

  const nextSession = upcoming[0];

  const handleJoin = (session: LiveSession) => {
    if (session.zoom_link) {
      Linking.openURL(session.zoom_link);
    }
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <TopBar
        rightElement={
          <NotificationBell
            count={unreadCount}
            onPress={() =>
              navigation.navigate('More', { screen: 'Notifications' })
            }
          />
        }
      />

      <ScreenHeader
        icon="video"
        image={require('../../assets/livesessions.png')}
        title="Live Sessions"
      />

      {loading ? (
        <View style={[styles.list, styles.cardSpaced]}>
          <Skeleton height={92} radius={16} />
          <Skeleton height={92} radius={16} />
          <Skeleton height={92} radius={16} />
        </View>
      ) : error ? (
        <Text style={[styles.errorText, styles.cardSpaced]}>
          Couldn't load sessions: {error}
        </Text>
      ) : (
        <>
          <View style={styles.statsRow}>
            <InsightCard
              variant="gradient"
              icon="calendar"
              label="This Week"
              value={String(thisWeekCount)}
            />
            <InsightCard
              variant="gradient"
              icon="clock"
              label="Next Session"
              value={nextSession ? formatDateOnly(nextSession.session_date) : 'None'}
            />
          </View>

          {upcoming.length === 0 ? (
            <EmptyStateCard
              icon="video"
              iconVariant="plain"
              title="No Upcoming Sessions"
              subtitle="Check back later for new live trading sessions."
              style={styles.cardSpaced}
            />
          ) : (
            <View style={[styles.list, styles.cardSpaced]}>
              {upcoming.map((session) => {
                const locked =
                  (session.tier === 'premium' || sectionPremium) &&
                  !hasPremiumAccess;
                return (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionHeaderRow}>
                      <View style={styles.sessionIconCircle}>
                        <Feather name="video" size={16} color={colors.link} />
                      </View>
                      <View style={styles.sessionTitleCol}>
                        <Text style={styles.sessionTitle} numberOfLines={2}>
                          {session.title}
                        </Text>
                        {!!session.host && (
                          <Text style={styles.sessionHost}>
                            Hosted by {session.host}
                          </Text>
                        )}
                      </View>
                      {locked && (
                        <View style={styles.premiumPill}>
                          <Feather name="lock" size={11} color={colors.warning} />
                          <Text style={styles.premiumPillText}>Premium</Text>
                        </View>
                      )}
                    </View>

                    {!!session.description && (
                      <Text style={styles.sessionDescription} numberOfLines={3}>
                        {session.description}
                      </Text>
                    )}

                    <View style={styles.sessionDateRow}>
                      <Feather name="calendar" size={12} color={colors.textFaint} />
                      <Text style={styles.sessionDate}>
                        {formatSessionDate(
                          session.session_date,
                          session.session_time
                        )}
                        {session.duration ? ` • ${session.duration} min` : ''}
                      </Text>
                    </View>

                    {!!session.zoom_password && !locked && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.passwordChip,
                          copiedId === session.id && styles.passwordChipCopied,
                          pressed && styles.passwordChipPressed,
                        ]}
                        onPress={() => handleCopyPassword(session)}
                      >
                        <Text style={styles.passwordLabel}>Passcode</Text>
                        <Text style={styles.passwordValue}>
                          {session.zoom_password}
                        </Text>
                        <Feather
                          name={copiedId === session.id ? 'check' : 'copy'}
                          size={12}
                          color={
                            copiedId === session.id
                              ? colors.accentGreen
                              : colors.textFaint
                          }
                        />
                      </Pressable>
                    )}

                    <PrimaryButton
                      label={locked ? 'Connect PrimeXBT' : 'Join session'}
                      icon={locked ? 'lock' : 'video'}
                      variant="flat"
                      disabled={!locked && !session.zoom_link}
                      onPress={() => (locked ? connect.open() : handleJoin(session))}
                      style={styles.joinButton}
                    />
                  </View>
                );
              })}
            </View>
          )}
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
  cardSpaced: {
    marginTop: 20,
  },
  list: {
    gap: 14,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    ...shadows.sm,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sessionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTitleCol: {
    flex: 1,
  },
  sessionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningDim,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumPillText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
  },
  sessionHost: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  sessionDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  sessionDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  sessionDate: {
    color: colors.textFaint,
    fontSize: 13,
  },
  passwordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  passwordChipCopied: {
    borderColor: 'rgba(37,211,102,0.4)',
    backgroundColor: 'rgba(37,211,102,0.1)',
  },
  passwordChipPressed: {
    opacity: 0.7,
  },
  passwordLabel: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '700',
  },
  passwordValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  joinButton: {
    height: 44,
    marginTop: 14,
  },
});
