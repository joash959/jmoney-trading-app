import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

type Props = {
  children: ReactNode;
  /** Layout/positioning overrides (margin, alignSelf, flex...) - applied to the outer shadow wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Visual/content overrides (padding, borderColor, alignItems...) - applied to the inner surface. */
  contentStyle?: StyleProp<ViewStyle>;
};

/** Flat solid-fill card - kept as GlassCard so every existing screen picks
 * up the new PrimeXBT-style look without call-site changes. */
export default function GlassCard({ children, style, contentStyle }: Props) {
  return (
    <View style={[styles.shadowWrap, style]}>
      <View style={[styles.card, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
});
