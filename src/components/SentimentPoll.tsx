import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import SurfaceCard from './SurfaceCard';

type Sentiment = 'bearish' | 'bullish';

export default function SentimentPoll() {
  const [dismissed, setDismissed] = useState(false);
  const [picked, setPicked] = useState<Sentiment | null>(null);

  if (dismissed) return null;

  const handlePick = (sentiment: Sentiment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPicked(sentiment);
  };

  return (
    <SurfaceCard>
      <View style={styles.headerRow}>
        <Text style={styles.title}>How do you feel about the market today?</Text>
        <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
          <Feather name="x" size={18} color={colors.textFaint} />
        </Pressable>
      </View>

      {picked ? (
        <View style={styles.resultRow}>
          <Feather
            name={picked === 'bullish' ? 'trending-up' : 'trending-down'}
            size={16}
            color={picked === 'bullish' ? colors.accentGreen : colors.accentRed}
          />
          <Text style={styles.resultText}>
            You're feeling {picked}. Check back tomorrow!
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
