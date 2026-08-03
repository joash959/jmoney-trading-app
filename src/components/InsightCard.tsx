import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor?: string;
  label: string;
  value: string;
  valueColor?: string;
  sublabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function InsightCard({
  icon,
  iconColor = colors.link,
  label,
  value,
  valueColor = colors.text,
  sublabel,
  style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Feather name={icon} size={16} color={iconColor} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
      {sublabel && (
        <Text style={styles.sublabel} numberOfLines={1}>
          {sublabel}
        </Text>
      )}
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
    padding: 14,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
  },
  sublabel: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
});
