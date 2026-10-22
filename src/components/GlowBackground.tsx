import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors } from '../theme/colors';

type GlowSpec = {
  /** Centre, as a fraction of screen width/height. */
  x: number;
  y: number;
  size: number;
  rgb: string;
  alpha: number;
};

// Two faint, still glows near the top - enough colour for the glass
// navigation to pick up, calm enough for a finance app.
const GLOWS: GlowSpec[] = [
  { x: 0.1, y: 0.04, size: 420, rgb: '47,107,255', alpha: 0.16 },
  { x: 0.95, y: 0.16, size: 380, rgb: '40,150,255', alpha: 0.12 },
];

const RINGS = 28;

/** Near-black backdrop with soft static glows. Each glow is a stack of
 * translucent circles (a radial gradient without SVG or blur). */
export default function GlowBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.base} pointerEvents="none">
      {GLOWS.map((glow, g) => (
        <View
          key={g}
          style={{
            position: 'absolute',
            left: glow.x * width - glow.size / 2,
            top: glow.y * height - glow.size / 2,
            width: glow.size,
            height: glow.size,
          }}
        >
          {Array.from({ length: RINGS }, (_, i) => {
            const d = glow.size * (1 - i / RINGS);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: (glow.size - d) / 2,
                  top: (glow.size - d) / 2,
                  width: d,
                  height: d,
                  borderRadius: d / 2,
                  backgroundColor: `rgba(${glow.rgb},${glow.alpha / RINGS})`,
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
