import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors } from '../theme/colors';

type OrbSpec = {
  /** Centre, as a fraction of screen width/height. */
  x: number;
  y: number;
  size: number;
  rgb: string;
  alpha: number;
  /** Drift distance (px) and loop duration (ms). */
  drift: number;
  duration: number;
};

// Mixed hues at low strength so the glass has colour to refract without
// any single tint taking over.
const ORBS: OrbSpec[] = [
  { x: 0.12, y: 0.06, size: 380, rgb: '123,97,255', alpha: 0.32, drift: 26, duration: 16000 },
  { x: 0.92, y: 0.2, size: 340, rgb: '64,132,255', alpha: 0.28, drift: 32, duration: 19000 },
  { x: 0.2, y: 0.62, size: 320, rgb: '46,200,170', alpha: 0.14, drift: 24, duration: 22000 },
  { x: 0.85, y: 0.82, size: 300, rgb: '170,90,255', alpha: 0.14, drift: 22, duration: 18000 },
];

/** Near-black backdrop with soft, slowly drifting colour glows and faint
 * star specks - the "living" layer the liquid-glass surfaces refract.
 * Glows are stacks of translucent circles (a radial gradient without SVG
 * or blur), animated on the native driver, so they're cheap everywhere. */
export default function GlowBackground() {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => makeStars(width, height), [width, height]);

  return (
    <View style={styles.base} pointerEvents="none">
      {ORBS.map((orb, i) => (
        <Orb key={i} spec={orb} screenWidth={width} screenHeight={height} />
      ))}
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
    </View>
  );
}

const RINGS = 28;

function Orb({
  spec,
  screenWidth,
  screenHeight,
}: {
  spec: OrbSpec;
  screenWidth: number;
  screenHeight: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: spec.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: spec.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, spec.duration]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-spec.drift, spec.drift] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [spec.drift * 0.6, -spec.drift * 0.6] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });

  const ringAlpha = spec.alpha / RINGS;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: spec.x * screenWidth - spec.size / 2,
        top: spec.y * screenHeight - spec.size / 2,
        width: spec.size,
        height: spec.size,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      {Array.from({ length: RINGS }, (_, i) => {
        // Rings shrink towards the centre; overlapping alpha builds a soft
        // falloff that's densest in the middle.
        const d = spec.size * (1 - i / RINGS);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: (spec.size - d) / 2,
              top: (spec.size - d) / 2,
              width: d,
              height: d,
              borderRadius: d / 2,
              backgroundColor: `rgba(${spec.rgb},${ringAlpha})`,
            }}
          />
        );
      })}
    </Animated.View>
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
  return Array.from({ length: 36 }, () => ({
    x: rand() * width,
    y: rand() * height * 0.9,
    size: rand() < 0.85 ? 1.5 : 2,
    opacity: 0.1 + rand() * 0.25,
  }));
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
