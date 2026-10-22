import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import type { Badge } from '../lib/gamification';
import Icon3D from './Icon3D';

/** Achievement grid: unlocked badges in full colour, locked ones dimmed
 * with a progress bar towards unlocking. */
export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <View key={badge.key} style={[styles.tile, badge.unlocked && styles.tileUnlocked]}>
          <View style={[styles.emojiWrap, badge.unlocked && styles.emojiWrapUnlocked]}>
            <Icon3D name={badge.icon} size={46} muted={!badge.unlocked} />
          </View>
          <Text style={[styles.title, !badge.unlocked && styles.titleLocked]} numberOfLines={1}>
            {badge.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {badge.description}
          </Text>
          {badge.unlocked ? (
            <Text style={styles.unlockedText}>Unlocked</Text>
          ) : (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(badge.progress * 100)}%` }]} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  tile: {
    width: '48.5%',
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    padding: 14,
  },
  tileUnlocked: {
    backgroundColor: 'rgba(47,107,255,0.12)',
  },
  emojiWrap: {
    height: 52,
    justifyContent: 'center',
  },
  emojiWrapUnlocked: {},
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  titleLocked: {
    color: colors.textMuted,
  },
  description: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    minHeight: 32,
  },
  unlockedText: {
    color: colors.link,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceTrack,
    marginTop: 10,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
