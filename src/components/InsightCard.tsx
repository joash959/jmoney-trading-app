import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
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
        <Feather name={icon} size={13} color={iconColor} />
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
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
    padding: 10,
    ...shadows.sm,
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
  value: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  sublabel: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 1,
  },
});
