import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function GlowBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#7C3AED', 'transparent']}
        style={[styles.orb, styles.orbTop]}
      />
      <LinearGradient
        colors={['#2F6FEF', 'transparent']}
        style={[styles.orb, styles.orbBottom]}
      />
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.35,
  },
  orbTop: {
    top: -140,
    left: -100,
  },
  orbBottom: {
    top: 280,
    right: -140,
  },
});
