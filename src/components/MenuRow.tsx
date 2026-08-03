import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress?: () => void;
  destructive?: boolean;
};

export default function MenuRow({ icon, label, onPress, destructive }: Props) {
  const tint = destructive ? colors.accentRed : colors.text;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Feather name={icon} size={20} color={tint} />
        <Text style={[styles.label, { color: tint }]}>{label}</Text>
      </View>
      {!destructive && (
        <Feather name="chevron-right" size={18} color={colors.textFaint} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderRadius: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
