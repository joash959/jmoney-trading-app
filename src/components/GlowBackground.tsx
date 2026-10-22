import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

/** Near-black backdrop with soft diagonal light streaks in the JMONEY
 * violet/blue. Each streak is a gradient band wider than the screen, so
 * only its feathered long edges are ever visible - no hard shapes, no blur
 * needed (blur isn't reliable on Android). */
export default function GlowBackground() {
  return (
    <View style={styles.base} pointerEvents="none">
      <View style={[styles.band, styles.wideBand]}>
        <LinearGradient
          colors={['rgba(123,97,255,0)', 'rgba(123,97,255,0.16)', 'rgba(79,124,255,0.06)', 'rgba(79,124,255,0)']}
          locations={[0, 0.45, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[styles.band, styles.coreBand]}>
        <LinearGradient
          colors={['rgba(150,140,255,0)', 'rgba(150,140,255,0.22)', 'rgba(150,140,255,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[styles.band, styles.streakLine]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(200,195,255,0.22)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Fade the streaks out before the content area so lists stay calm. */}
      <LinearGradient
        colors={['rgba(8,8,11,0)', colors.background]}
        locations={[0.25, 0.6]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    left: '-60%',
    width: '220%',
    transform: [{ rotate: '-32deg' }],
  },
  wideBand: {
    top: 40,
    height: 280,
  },
  coreBand: {
    top: 130,
    height: 70,
  },
  streakLine: {
    top: 164,
    height: 1.5,
  },
});
