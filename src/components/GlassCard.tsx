import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import GlassSheen from './GlassSheen';

type Props = {
  children: ReactNode;
  /** Layout/positioning overrides (margin, alignSelf, flex...) - applied to the outer wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Visual/content overrides (padding, borderColor, alignItems...) - applied to the inner surface. */
  contentStyle?: StyleProp<ViewStyle>;
};

/** Translucent glass card with a hairline edge - the base surface of the app. */
export default function GlassCard({ children, style, contentStyle }: Props) {
  return (
    <View style={style}>
      <View style={[styles.card, contentStyle]}>
        <GlassSheen />
        {children}
      </View>
    </View>
  );
}

export const glassCardStyle: ViewStyle = {
  backgroundColor: colors.card,
  borderRadius: radius.xl,
  padding: spacing.lg,
  overflow: 'hidden',
};

const styles = StyleSheet.create({
  card: glassCardStyle,
});
