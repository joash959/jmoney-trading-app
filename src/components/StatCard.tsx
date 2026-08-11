import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  /** Optional real icon artwork - overrides the Ionicons glyph when provided. */
  image?: number;
  trendLabel?: string;
  value: string;
  label: string;
  sublabel: string;
  style?: StyleProp<ViewStyle>;
};

export default function StatCard({
  icon,
  image,
  trendLabel,
  value,
  label,
  sublabel,
  style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        {image ? (
          <Image source={image} style={styles.iconImagePlain} resizeMode="contain" />
        ) : (
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={16} color={colors.link} />
          </View>
        )}
        {trendLabel && (
          <View style={styles.trendPill}>
            <Ionicons name="trending-up-outline" size={10} color={colors.accentGreen} />
            <Text style={styles.trendText}>{trendLabel}</Text>
          </View>
        )}
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sublabel} numberOfLines={1}>
        {sublabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImagePlain: {
    width: 38,
    height: 38,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(37,211,102,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendText: {
    color: colors.accentGreen,
    fontSize: 10,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  sublabel: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
});
