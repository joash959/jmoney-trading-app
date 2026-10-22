import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { IoniconName } from './IconBadge';

type Props = {
  /** Kept for call-site compatibility; headers are text-only now. */
  icon?: IoniconName;
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Large page title, e.g. "Live sessions" - text only, like the Alerts screen. */
export default function ScreenHeader({
  title,
  subtitle,
  rightElement,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {rightElement}
      </View>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: 15,
    lineHeight: 22,
  },
});
