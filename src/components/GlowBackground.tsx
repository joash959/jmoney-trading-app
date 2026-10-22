import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

/** Neutral near-black backdrop after the Syfter reference: a soft, cool
 * glow falling from the top centre, faint star specks, and a barely-there
 * chart line across the lower half. No hard lines and no colour cast -
 * built from gradients and plain views (no SVG or blur), so it renders the
 * same on iOS and Android. */
export default function GlowBackground() {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => makeStars(width, height), [width, height]);
  const chart = useMemo(() => makeChartSegments(width, height), [width, height]);

  return (
    <View style={styles.base} pointerEvents="none">
      {/* Glow: feathered on both sides, fading out downwards. */}
      <View style={styles.glowArea}>
        <LinearGradient
          colors={[
            'rgba(190,195,225,0)',
            'rgba(190,195,225,0.035)',
            'rgba(190,195,225,0.07)',
            'rgba(190,195,225,0.035)',
            'rgba(190,195,225,0)',
          ]}
          locations={[0.08, 0.3, 0.5, 0.7, 0.92]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(10,10,13,0)', colors.background]}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {stars.map((star, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {chart.map((seg, i) => (
        <View
          key={`c${i}`}
          style={[
            styles.chartSegment,
            {
              left: seg.cx - seg.length / 2,
              top: seg.cy - 0.75,
              width: seg.length,
              transform: [{ rotate: `${seg.angle}rad` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

/** Small deterministic PRNG so the star field is identical on every render. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeStars(width: number, height: number) {
  const rand = seeded(42);
  return Array.from({ length: 40 }, () => ({
    x: rand() * width,
    y: rand() * height * 0.85,
    size: rand() < 0.85 ? 1.5 : 2,
    opacity: 0.08 + rand() * 0.22,
  }));
}

/** A jagged price line across the lower part of the screen, drawn as short
 * rotated segments. */
function makeChartSegments(width: number, height: number) {
  const rand = seeded(7);
  const baseY = height * 0.72;
  const points: { x: number; y: number }[] = [];
  const steps = 34;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * (width + 40) - 20;
    const swell = Math.sin((i / steps) * Math.PI * 2.2) * height * 0.05;
    const y = baseY - swell + (rand() - 0.5) * height * 0.06;
    points.push({ x, y });
  }
  return points.slice(1).map((p, i) => {
    const prev = points[i];
    const dx = p.x - prev.x;
    const dy = p.y - prev.y;
    return {
      cx: (p.x + prev.x) / 2,
      cy: (p.y + prev.y) / 2,
      length: Math.sqrt(dx * dx + dy * dy) + 1,
      angle: Math.atan2(dy, dx),
    };
  });
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  glowArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  chartSegment: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
