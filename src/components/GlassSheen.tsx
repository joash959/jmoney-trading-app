import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/colors';

/** Soft top-left sheen plus a bright specular rim along the top edge -
 * what makes a translucent card read as liquid glass. Drop it in as the
 * first child of any card with `overflow: 'hidden'`. */
export default function GlassSheen({
  colors = gradients.glassSheen,
}: {
  colors?: readonly [string, string, ...string[]];
}) {
  return (
    <>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 0.8 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.32)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rim}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  rim: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
  },
});
