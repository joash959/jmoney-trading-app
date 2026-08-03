import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

type Props = {
  children: ReactNode;
  /** Layout/positioning overrides (margin, alignSelf, flex...) - applied to the outer shadow wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Visual/content overrides (padding, borderColor, alignItems...) - applied to the inner glass surface. */
  contentStyle?: StyleProp<ViewStyle>;
};

export default function GlassCard({ children, style, contentStyle }: Props) {
  return (
    <View style={[styles.shadowWrap, style]}>
      <BlurView intensity={40} tint="dark" style={[styles.card, contentStyle]}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
});
