import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import GlassSheen from './GlassSheen';
import { glassCardStyle } from './GlassCard';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

/** Glass card that can also be tappable. Same surface as GlassCard. */
export default function SurfaceCard({ children, style, onPress }: Props) {
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        onPress={onPress}
      >
        <GlassSheen />
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <GlassSheen />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: glassCardStyle,
  pressed: {
    opacity: 0.8,
  },
});
