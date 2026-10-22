import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

/** Indigo-black backdrop after the Syfter reference: a soft vertical light
 * beam falling from the top centre, faint star specks, and a dim chart
 * line across the lower half. Built from gradients and plain views (no SVG
 * or blur), so it renders the same on iOS and Android. */
export default function GlowBackground() {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => makeStars(width, height), [width, height]);
  const chart = useMemo(() => makeChartSegments(width, height), [width, height]);

  return (
    <View style={styles.base} pointerEvents="none">
      {/* Beam: wide soft glow + narrower core, both fading out downwards. */}
      <View style={styles.beamArea}>
        <LinearGradient
          colors={['rgba(108,99,255,0)', 'rgba(108,99,255,0.16)', 'rgba(108,99,255,0)']}
          locations={[0.1, 0.5, 0.9]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            'rgba(160,150,255,0)',
            'rgba(160,150,255,0.07)',
            'rgba(160,150,255,0.2)',
            'rgba(160,150,255,0.07)',
            'rgba(160,150,255,0)',
          ]}
          locations={[0.28, 0.41, 0.5, 0.59, 0.72]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(9,8,15,0)', colors.background]}
          locations={[0.05, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Thin bright core of the beam, with a slightly wider halo. */}
      <LinearGradient
        colors={['rgba(150,140,255,0.25)', 'rgba(150,140,255,0)']}
        style={[styles.beamHalo, { left: width / 2 - 4 }]}
      />
      <LinearGradient
        colors={['rgba(215,210,255,0.5)', 'rgba(150,140,255,0.15)', 'rgba(150,140,255,0)']}
        locations={[0, 0.4, 1]}
        style={[styles.beamLine, { left: width / 2 - 0.5 }]}
      />

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
  return Array.from({ length: 46 }, () => ({
    x: rand() * width,
    y: rand() * height * 0.85,
    size: rand() < 0.85 ? 1.5 : 2.5,
    opacity: 0.12 + rand() * 0.35,
  }));
}

/** A jagged price line across the lower part of the screen, drawn as short
 * rotated segments. */
function makeChartSegments(width: number, height: number) {
  const rand = seeded(7);
  const baseY = height * 0.72;
  const points: { x: number; y: number }[] = [];
  const steps = 34;
  let y = baseY;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * (width + 40) - 20;
    // Gentle swell plus noise, like the Syfter silhouette.
    const swell = Math.sin((i / steps) * Math.PI * 2.2) * height * 0.05;
    y = baseY - swell + (rand() - 0.5) * height * 0.06;
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
  beamArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '62%',
  },
  beamHalo: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: '30%',
  },
  beamLine: {
    position: 'absolute',
    top: 0,
    width: 1,
    height: '36%',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  chartSegment: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(108,99,255,0.18)',
  },
});
