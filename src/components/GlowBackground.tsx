import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';

export default function GlowBackground() {
  return (
    <View style={styles.base} pointerEvents="none">
      <LinearGradient
        colors={['#7C3AED', 'transparent']}
        style={[styles.orb, styles.orbTop]}
      />
      <LinearGradient
        colors={['#2F6FEF', 'transparent']}
        style={[styles.orb, styles.orbBottom]}
      />
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.16,
  },
  orbTop: {
    top: -120,
    left: -110,
  },
  orbBottom: {
    top: 300,
    right: -150,
  },
});
