import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LiveSession } from '../types/database';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InsightCard from '../components/InsightCard';
import EmptyStateCard from '../components/EmptyStateCard';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

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

export default function LiveScreen() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('live_sessions')
      .select('*')
      .eq('is_active', true)
      .order('session_date', { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setSessions((data as LiveSession[]) ?? []);
        }
        setLoading(false);
      });
  }, []);

  const now = new Date();
  const upcoming = sessions.filter(
    (session) => new Date(`${session.session_date}T${session.session_time ?? '23:59:59'}`) >= now
  );

  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = upcoming.filter(
    (session) => new Date(session.session_date) <= oneWeekFromNow
  ).length;

  const nextSession = upcoming[0];
  const hasPremiumAccess = profile?.tier === 'premium';

  const handleJoin = (session: LiveSession) => {
    if (session.zoom_link) {
      Linking.openURL(session.zoom_link);
    }
  };

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

      {loading ? (
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.cardSpaced}
        />
      ) : error ? (
        <Text style={[styles.errorText, styles.cardSpaced]}>
          Couldn't load sessions: {error}
        </Text>
      ) : (
        <>
          <View style={styles.statsRow}>
            <InsightCard
              icon="calendar"
              label="This Week"
              value={String(thisWeekCount)}
            />
            <InsightCard
              icon="clock"
              iconColor={colors.accentGreen}
              label="Next Session"
              value={
                nextSession
                  ? formatSessionDate(
                      nextSession.session_date,
                      nextSession.session_time
                    )
                  : 'None'
              }
              valueColor={colors.accentGreen}
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
                const locked = session.tier === 'premium' && !hasPremiumAccess;
                return (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionHeaderRow}>
                      <Text style={styles.sessionTitle} numberOfLines={2}>
                        {session.title}
                      </Text>
                      {locked && (
                        <View style={styles.premiumPill}>
                          <Feather name="lock" size={11} color="#F5C518" />
                          <Text style={styles.premiumPillText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    {!!session.host && (
                      <Text style={styles.sessionHost}>
                        Hosted by {session.host}
                      </Text>
                    )}
                    <Text style={styles.sessionDate}>
                      {formatSessionDate(
                        session.session_date,
                        session.session_time
                      )}
                    </Text>
                    <Pressable
                      style={[
                        styles.joinButton,
                        (locked || !session.zoom_link) && styles.joinButtonDisabled,
                      ]}
                      disabled={locked || !session.zoom_link}
                      onPress={() => handleJoin(session)}
                    >
                      <Feather name="video" size={14} color={colors.text} />
                      <Text style={styles.joinButtonText}>
                        {locked ? 'Premium only' : 'Join session'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

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
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  sessionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,197,24,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumPillText: {
    color: '#F5C518',
    fontSize: 10,
    fontWeight: '700',
  },
  sessionHost: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  sessionDate: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentBlue,
    borderRadius: 14,
    height: 44,
    marginTop: 14,
  },
  joinButtonDisabled: {
    backgroundColor: colors.inputBackground,
  },
  joinButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
