import { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({ children, style }: Props) {
  return (
    <BlurView intensity={40} tint="dark" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
});
