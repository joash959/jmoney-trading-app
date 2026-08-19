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
        <View style={styles.resultRow}>
          <Ionicons
            name={picked === 'bullish' ? 'trending-up-outline' : 'trending-down-outline'}
            size={16}
            color={picked === 'bullish' ? colors.accentGreen : colors.accentRed}
          />
          <Text style={styles.resultText}>
            You're feeling {picked}.{' '}
            {counts
              ? `${percentage(counts, 'bullish')}% Bullish · ${percentage(counts, 'bearish')}% Bearish today.`
              : 'Check back tomorrow!'}
          </Text>
        </View>
      ) : (
        <View style={styles.pillRow}>
          <Pressable
            style={styles.bearish}
            onPress={() => handlePick('bearish')}
          >
            <Text style={styles.pillText}>Bearish</Text>
          </Pressable>
          <Pressable
            style={styles.bullish}
            onPress={() => handlePick('bullish')}
          >
            <Text style={styles.pillText}>Bullish</Text>
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
    ...typography.bodyStrong,
  },
  pillRow: {
    flexDirection: 'row',
    height: 48,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  bearish: {
    flex: 1,
    backgroundColor: colors.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bullish: {
    flex: 1,
    backgroundColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    color: colors.text,
    ...typography.bodyStrong,
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
});
