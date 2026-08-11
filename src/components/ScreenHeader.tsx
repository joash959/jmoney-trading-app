import { ReactNode } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Optional real icon artwork - overrides the Ionicons glyph when provided. */
  image?: number;
};

export default function ScreenHeader({
  icon,
  title,
  subtitle,
  rightElement,
  style,
  image,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        {image ? (
          <Image source={image} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={22} color={colors.link} />
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>
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
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.accentBlueDim,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  iconImage: {
    width: 48,
    height: 48,
  },
  title: {
    flex: 1,
    color: colors.text,
    ...typography.title1,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.xs + 2,
    ...typography.body,
  },
});
