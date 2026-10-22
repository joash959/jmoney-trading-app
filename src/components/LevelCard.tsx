import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from './AppText';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import type { GameStats } from '../lib/gamification';
import Icon3D from './Icon3D';
import GlassSheen from './GlassSheen';

type Props = {
  stats: GameStats | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Player card: level badge, name, animated XP bar, streak and the next
 * badge to chase - the gamified heart of Home. */
export default function LevelCard({ stats, onPress, style }: Props) {
  const fill = useRef(new Animated.Value(0)).current;
  const span = stats ? Math.max(stats.levelCeil - stats.levelFloor, 1) : 1;
  const pct = stats
    ? stats.levelCeil === stats.levelFloor
      ? 1
      : Math.min((stats.xp - stats.levelFloor) / span, 1)
    : 0;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, fill]);

  const nextBadge = stats?.badges
    .filter((b) => !b.unlocked)
    .sort((a, b) => b.progress - a.progress)[0];
  const unlocked = stats?.badges.filter((b) => b.unlocked).length ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
    >
      <GlassSheen />
      <View style={styles.topRow}>
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.levelBadge}>
          <Text style={styles.levelLabel}>LVL</Text>
          <Text numeric style={styles.levelNumber}>
            {stats?.level ?? 1}
          </Text>
        </LinearGradient>
        <View style={styles.middle}>
          <Text style={styles.levelName}>{stats?.levelName ?? 'Rookie'}</Text>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.trackFill,
                { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            >
              <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
          <Text numeric style={styles.xpText}>
            {stats ? `${stats.xp.toLocaleString('en-US')} XP` : '— XP'}
            {stats && stats.levelCeil > stats.levelFloor
              ? ` · ${(stats.levelCeil - stats.xp).toLocaleString('en-US')} to level ${stats.level + 1}`
              : ''}
          </Text>
        </View>
        <View style={[styles.streak, (stats?.streak ?? 0) > 0 && styles.streakActive]}>
          <Icon3D name="fire" size={34} muted={(stats?.streak ?? 0) === 0} />
          <Text numeric style={styles.streakNumber}>
            {stats?.streak ?? 0}
          </Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.badgeCountRow}>
          <Icon3D name="trophy" size={20} />
          <Text style={styles.badgeCount}>
            {unlocked}/{stats?.badges.length ?? 8} badges
          </Text>
        </View>
        {nextBadge && (
          <View style={styles.nextBadgeRow}>
            <Icon3D name={nextBadge.icon} size={18} />
            <Text style={styles.nextBadge} numberOfLines={1}>
              {nextBadge.title} · {Math.round(nextBadge.progress * 100)}%
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    backgroundColor: colors.card,
    padding: 16,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  levelBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F6BFF',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  levelLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  levelNumber: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  middle: {
    flex: 1,
  },
  levelName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceTrack,
    marginTop: 8,
    overflow: 'hidden',
  },
  trackFill: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpText: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 6,
  },
  streak: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 64,
  },
  streakActive: {},
  streakNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  streakLabel: {
    color: colors.textFaint,
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  badgeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextBadgeRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  nextBadge: {
    flexShrink: 1,
    color: colors.link,
    fontSize: 13,
    fontWeight: '500',
  },
});
