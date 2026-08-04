import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

type Props = {
  label?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  placeholder: string;
  value?: string;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function SelectField({
  label,
  icon,
  placeholder,
  value,
  onPress,
  containerStyle,
}: Props) {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.wrapper} onPress={onPress}>
        <View style={styles.left}>
          {icon && <Feather name={icon} size={16} color={colors.textFaint} />}
          <Text
            style={value ? styles.value : styles.placeholder}
            numberOfLines={1}
          >
            {value ?? placeholder}
          </Text>
        </View>
        <Feather name="chevron-down" size={18} color={colors.textFaint} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    height: 48,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  placeholder: {
    flex: 1,
    color: colors.textFaint,
    fontSize: 14,
  },
  value: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
});
