import { ReactNode } from 'react';
import {
  Animated,
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { useFocusGlow } from '../hooks/useFocusGlow';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  rightElement?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FormInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  rightElement,
  containerStyle,
}: Props) {
  const glow = useFocusGlow();

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[styles.inputWrapper, { borderColor: glow.borderColor }]}
      >
        {icon && <Feather name={icon} size={18} color={colors.textFaint} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={glow.onFocus}
          onBlur={glow.onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
        {rightElement}
      </Animated.View>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
});
