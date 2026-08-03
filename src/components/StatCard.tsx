import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  trendLabel?: string;
  value: string;
  label: string;
  sublabel: string;
  style?: StyleProp<ViewStyle>;
};

export default function StatCard({
  icon,
  trendLabel,
  value,
  label,
  sublabel,
  style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={16} color={colors.link} />
        </View>
        {trendLabel && (
          <View style={styles.trendPill}>
            <Feather name="trending-up" size={10} color={colors.accentGreen} />
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
    padding: spacing.sm + 2,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
