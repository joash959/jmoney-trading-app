import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor: string;
  label: string;
  amount: string;
  amountColor: string;
  backgroundColor: string;
  borderColor: string;
};

export default function PrizeTile({
  icon,
  iconColor,
  label,
  amount,
  amountColor,
  backgroundColor,
  borderColor,
}: Props) {
  return (
    <View style={[styles.tile, { backgroundColor, borderColor }]}>
      <Feather name={icon} size={22} color={iconColor} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
});
