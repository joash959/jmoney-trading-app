import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'] | null;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** 'tonal' is a neutral glass button for repeated, lower-emphasis actions. */
  variant?: 'gradient' | 'flat' | 'tonal';
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  label,
  icon = 'arrow-forward-outline',
  onPress,
  disabled = false,
  loading = false,
  variant = 'gradient',
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  // `style` is meant for the visible button, but flex sizing only works on
  // the outermost wrapper - left on the inner gradient, `flex: 1` in a row
  // collapses the button to zero width and only the label shows.
  const {
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    ...visualStyle
  } = StyleSheet.flatten(style) ?? {};
  const layout = { flex, flexGrow, flexShrink, flexBasis, alignSelf };

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const content = loading ? (
    <ActivityIndicator color={colors.text} size="small" />
  ) : (
    <>
      <Text style={styles.buttonText}>{label}</Text>
      {icon && <Ionicons name={icon} size={18} color={colors.text} />}
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={layout}
    >
      <Animated.View
        style={[{ transform: [{ scale }] }, isDisabled && styles.disabled]}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={gradients.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, styles.gradientShadow, visualStyle]}
          >
            {content}
          </LinearGradient>
        ) : (
          <Animated.View
            style={[
              styles.button,
              variant === 'tonal' ? styles.tonalButton : styles.flatButton,
              visualStyle,
            ]}
          >
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
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  flatButton: {
    backgroundColor: colors.accentBlue,
  },
  tonalButton: {
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  disabled: {
    opacity: 0.5,
  },
});
