import {
  Animated,
  StyleProp,
  StyleSheet,
  TextInput,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { useFocusGlow } from '../hooks/useFocusGlow';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
};

export default function SearchBar({ value, onChangeText, placeholder, style }: Props) {
  const glow = useFocusGlow();

  return (
    <Animated.View style={[styles.wrapper, { borderColor: glow.borderColor }, style]}>
      <Feather name="search" size={18} color={colors.textFaint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={glow.onFocus}
        onBlur={glow.onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
