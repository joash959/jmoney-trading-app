import { useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'] | null;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'gradient' | 'flat';
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  label,
  icon = 'arrow-right',
  onPress,
  disabled = false,
  variant = 'gradient',
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const content = (
    <>
      <Text style={styles.buttonText}>{label}</Text>
      {icon && <Feather name={icon} size={18} color={colors.text} />}
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[{ transform: [{ scale }] }, disabled && styles.disabled]}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={gradients.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, styles.gradientShadow, style]}
          >
            {content}
          </LinearGradient>
        ) : (
          <Animated.View style={[styles.button, styles.flatButton, style]}>
            {content}
          </Animated.View>
        )}
      </Animated.View>
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
  },
  gradientShadow: {
    ...shadows.glow,
  },
  flatButton: {
    backgroundColor: colors.accentBlue,
    ...shadows.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
