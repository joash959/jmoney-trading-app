import { useRef } from 'react';
import { Animated } from 'react-native';
import { colors } from '../theme/colors';

export function useFocusGlow() {
  const anim = useRef(new Animated.Value(0)).current;

  const onFocus = () =>
    Animated.timing(anim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();

  const onBlur = () =>
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.inputBorder, colors.accentBlue],
  });

  return { onFocus, onBlur, borderColor };
}
