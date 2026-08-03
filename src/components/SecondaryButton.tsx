import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function SecondaryButton({ label, icon, onPress, style }: Props) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      {icon && <Feather name={icon} size={16} color={colors.text} />}
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 18,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
