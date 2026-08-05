import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor?: string;
  label: string;
  value: string;
  valueColor?: string;
  sublabel?: string;
  /** Tighter padding, smaller type, no sublabel - for dense multi-card rows. */
  compact?: boolean;
  /** 'gradient' matches the blue gradient cards used on Home. */
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
  const isGradient = variant === 'gradient';

  const content = (
    <>
      <View style={styles.headerRow}>
        <Feather
          name={icon}
          size={compact ? 11 : 13}
          color={isGradient ? colors.text : iconColor}
        />
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            isGradient && styles.labelGradient,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.value,
          compact && styles.valueCompact,
          { color: isGradient ? colors.text : valueColor },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {sublabel && !compact && (
        <Text
          style={[styles.sublabel, isGradient && styles.sublabelGradient]}
          numberOfLines={1}
        >
          {sublabel}
        </Text>
      )}
    </>
  );

  if (isGradient) {
    return (
      <LinearGradient
        colors={gradients.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          compact && styles.cardCompact,
          styles.cardGradient,
          style,
        ]}
      >
        {content}
      </LinearGradient>
    );
  }

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
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: 10,
    ...shadows.sm,
  },
  cardCompact: {
    padding: 7,
    borderRadius: radius.md,
  },
  cardGradient: {
    borderWidth: 0,
    ...shadows.glow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 9,
  },
  labelGradient: {
    color: 'rgba(255,255,255,0.85)',
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  valueCompact: {
    fontSize: 13,
    marginTop: 3,
  },
  sublabel: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 1,
  },
  sublabelGradient: {
    color: 'rgba(255,255,255,0.75)',
  },
});
