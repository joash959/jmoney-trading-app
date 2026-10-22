import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  label: string;
  value: string;
  valueColor?: string;
  sublabel?: string;
  /** Tighter padding, smaller type, no sublabel - for dense multi-card rows. */
  compact?: boolean;
  /** 'gradient' marks a featured stat: same flat card, blue label instead of a filled background. */
  variant?: 'flat' | 'gradient';
  style?: StyleProp<ViewStyle>;
};

export default function InsightCard({
  icon,
  iconColor = colors.link,
  label,
  value,
  valueColor = colors.text,
  sublabel,
  compact = false,
  variant = 'flat',
  style,
}: Props) {
  const isFeatured = variant === 'gradient';

  const content = (
    <>
      <View style={styles.headerRow}>
        <Ionicons
          name={icon}
          size={compact ? 11 : 13}
          color={isFeatured ? colors.textMuted : iconColor}
        />
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            isFeatured && styles.labelFeatured,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        numeric
        style={[
          styles.value,
          compact && styles.valueCompact,
          { color: isFeatured ? colors.text : valueColor },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {sublabel && !compact && (
        <Text
          style={styles.sublabel}
          numberOfLines={1}
        >
          {sublabel}
        </Text>
      )}
    </>
  );

  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
  },
  cardCompact: {
    padding: 9,
    borderRadius: radius.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 12,
  },
  labelFeatured: {
    color: colors.textMuted,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 6,
  },
  valueCompact: {
    fontSize: 13,
    marginTop: 3,
  },
  sublabel: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 1,
  },
});
