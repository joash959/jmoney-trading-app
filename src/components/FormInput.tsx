import { ReactNode } from 'react';
import { Animated, KeyboardTypeOptions, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radius } from '../theme/radius';
import { useFocusGlow } from '../hooks/useFocusGlow';
import { sentenceCase } from '../lib/textCase';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
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
      <Text style={styles.label}>{sentenceCase(label)}</Text>
      <Animated.View
        style={[styles.inputWrapper, { borderColor: glow.borderColor }]}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.textFaint} />}
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
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.interRegular,
  },
});
