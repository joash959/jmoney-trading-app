import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import IconBadge, { IoniconName } from './IconBadge';

type Props = {
  icon?: IoniconName;
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Large page title with an optional line-icon badge, e.g. "Live Sessions". */
export default function ScreenHeader({
  icon,
  title,
  subtitle,
  rightElement,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        {icon && <IconBadge icon={icon} size={42} />}
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
    fontSize: 28,
    lineHeight: 36,
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
