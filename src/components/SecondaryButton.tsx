import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function SecondaryButton({ label, icon, onPress, style }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style,
      ]}
      onPress={onPress}
    >
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
    borderRadius: radius.lg,
    backgroundColor: colors.buttonSecondary,
    paddingHorizontal: 18,
  },
  buttonPressed: {
    backgroundColor: colors.buttonSecondaryPressed,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
