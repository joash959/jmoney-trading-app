import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/colors';

/** Soft top-left sheen that makes a translucent card read as glass -
 * edgeless, no outline or rim line. Drop it in as the first child of any
 * card with `overflow: 'hidden'`. */
export default function GlassSheen({
  colors = gradients.glassSheen,
}: {
  colors?: readonly [string, string, ...string[]];
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.9, y: 0.8 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}
