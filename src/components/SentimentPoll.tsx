import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SurfaceCard from './SurfaceCard';

type Sentiment = 'bearish' | 'bullish';
type Counts = { bullish: number; bearish: number };

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function percentage(counts: Counts, key: Sentiment) {
  const total = counts.bullish + counts.bearish;
  if (total === 0) return 0;
  return Math.round((counts[key] / total) * 100);
}

export default function SentimentPoll() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [dismissed, setDismissed] = useState(false);
  const [picked, setPicked] = useState<Sentiment | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCounts = async () => {
    const { data } = await supabase.rpc('get_sentiment_counts', {
      p_date: todayDate(),
    });
    if (data && data.length > 0) {
      setCounts({
        bullish: data[0].bullish_count,
        bearish: data[0].bearish_count,
      });
    }
  };

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    supabase
      .from('market_sentiment_votes')
      .select('sentiment')
      .eq('user_id', userId)
      .eq('vote_date', todayDate())
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setPicked(data.sentiment as Sentiment);
        fetchCounts();
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (dismissed) return null;

  const handlePick = async (sentiment: Sentiment) => {
    if (!userId || submitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    setPicked(sentiment);
    await supabase
      .from('market_sentiment_votes')
      .upsert(
        { user_id: userId, vote_date: todayDate(), sentiment },
        { onConflict: 'user_id,vote_date' }
      );
    await fetchCounts();
    setSubmitting(false);
  };

  return (
    <SurfaceCard>
      <View style={styles.headerRow}>
        <Text style={styles.title}>How do you feel about the market today?</Text>
        <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
          <Ionicons name="close-outline" size={18} color={colors.textFaint} />
        </Pressable>
      </View>

      {picked ? (
        <View>
          <View style={styles.resultRow}>
            <Ionicons
              name={picked === 'bullish' ? 'trending-up-outline' : 'trending-down-outline'}
              size={16}
              color={picked === 'bullish' ? colors.accentGreen : colors.accentRed}
            />
            <Text style={styles.resultText}>
              You're feeling {picked}.{counts ? '' : ' Check back tomorrow!'}
            </Text>
          </View>
          {counts && (
            <>
              <View style={styles.splitBar}>
                <View
                  style={[
                    styles.splitSegment,
                    { flex: percentage(counts, 'bullish') || 0.0001, backgroundColor: colors.accentGreen },
                  ]}
                />
                <View
                  style={[
                    styles.splitSegment,
                    { flex: percentage(counts, 'bearish') || 0.0001, backgroundColor: colors.accentRed },
                  ]}
                />
              </View>
              <View style={styles.splitLegend}>
                <Text numeric style={[styles.splitText, { color: colors.accentGreen }]}>
                  {percentage(counts, 'bullish')}% bullish
                </Text>
                <Text numeric style={[styles.splitText, { color: colors.accentRed }]}>
                  {percentage(counts, 'bearish')}% bearish
                </Text>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.pillRow}>
          <Pressable
            style={({ pressed }) => [styles.bearish, pressed && styles.pressed]}
            onPress={() => handlePick('bearish')}
          >
            <Ionicons name="trending-down" size={16} color={colors.accentRed} />
            <Text style={styles.bearishText}>Bearish</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.bullish, pressed && styles.pressed]}
            onPress={() => handlePick('bullish')}
          >
            <Ionicons name="trending-up" size={16} color={colors.accentGreen} />
            <Text style={styles.bullishText}>Bullish</Text>
          </Pressable>
        </View>
      )}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  bearish: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,77,106,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bullish: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(46,230,166,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bearishText: {
    color: colors.accentRed,
    ...typography.bodyStrong,
  },
  bullishText: {
    color: colors.accentGreen,
    ...typography.bodyStrong,
  },
  pressed: {
    opacity: 0.7,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  resultText: {
    color: colors.textMuted,
    ...typography.callout,
  },
  splitBar: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginTop: spacing.sm,
  },
  splitSegment: {
    height: 8,
    borderRadius: 3,
  },
  splitLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  splitText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
