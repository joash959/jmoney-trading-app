import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/** Flat solid fill - kept as its own component so every screen that
 * already renders <GlowBackground /> doesn't need to change. Previously
 * rendered blurred purple/blue "glow" orbs, which read as an unwanted
 * blue color cast against the app's neutral gray theme - removed. */
export default function GlowBackground() {
  return <View style={styles.base} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
});
