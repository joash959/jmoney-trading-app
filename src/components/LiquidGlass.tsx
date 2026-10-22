import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';

// Decided once: native Liquid Glass needs iOS 26+ (and a build made with
// the iOS 26 SDK). Everywhere else gets the frosted fallback below.
const NATIVE_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'regular' = frosted (default), 'clear' = more see-through. */
  variant?: 'regular' | 'clear';
  /** Optional colour tint, e.g. a faint accent on a featured card. */
  tint?: string;
  /** Native glass reacts to touches (iOS 26 shimmer). Use on tappable glass. */
  interactive?: boolean;
  /** Blur strength for the non-native fallback. */
  intensity?: number;
  /** Real blur on Android too - costly, so only for a few large surfaces. */
  blurOnAndroid?: boolean;
};

/** Liquid-glass surface: Apple's native Liquid Glass on iOS 26, otherwise a
 * frosted blur with a soft sheen so it still reads as glass. Edgeless:
 * no border or rim line. Pass borderRadius/padding etc. through `style`. */
export default function LiquidGlass({
  children,
  style,
  variant = 'regular',
  tint,
  interactive = false,
  intensity = 28,
  blurOnAndroid = false,
}: Props) {
  if (NATIVE_GLASS) {
    return (
      <GlassView
        glassEffectStyle={variant}
        tintColor={tint}
        isInteractive={interactive}
        colorScheme="dark"
        style={[styles.native, style]}
      >
        {children}
      </GlassView>
    );
  }

  const useBlur = Platform.OS !== 'android' || blurOnAndroid;

  return (
    <View style={[styles.fallback, style]}>
      {useBlur && (
        <BlurView
          intensity={intensity}
          tint="dark"
          experimentalBlurMethod={blurOnAndroid ? 'dimezisBlurView' : 'none'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: useBlur ? 'rgba(30,30,38,0.42)' : 'rgba(30,30,38,0.78)' },
        ]}
        pointerEvents="none"
      />
      {tint && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} pointerEvents="none" />
      )}
      <GlassHighlights clear={variant === 'clear'} />
      {children}
    </View>
  );
}

/** Soft sheen that sells the glass - edgeless, no outline or rim line. */
export function GlassHighlights({ clear = false }: { clear?: boolean }) {
  return (
    <>
      <LinearGradient
        colors={[clear ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 0.75 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  native: {
    overflow: 'hidden',
  },
  fallback: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
