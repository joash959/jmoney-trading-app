import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import GlowBackground from './GlowBackground';

type Props = {
  children: ReactNode;
  overlay?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const PULL_RANGE = 100;

export default function ScreenShell({
  children,
  overlay,
  refreshing,
  onRefresh,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(24)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, offset]);

  const pullLogoHeight = scrollY.interpolate({
    inputRange: [-PULL_RANGE, 0],
    outputRange: [88, 0],
    extrapolate: 'clamp',
  });
  const pullLogoOpacity = scrollY.interpolate({
    inputRange: [-PULL_RANGE, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });
  const pullLogoScale = scrollY.interpolate({
    inputRange: [-PULL_RANGE, 0],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlowBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor="transparent"
                colors={['transparent']}
                progressBackgroundColor="transparent"
              />
            ) : undefined
          }
        >
          <Animated.View
            style={[
              styles.pullLogoWrap,
              { height: pullLogoHeight, opacity: pullLogoOpacity },
            ]}
          >
            <Animated.Image
              source={require('../../assets/jmoney-mark.png')}
              style={[
                styles.pullLogo,
                { transform: [{ scale: pullLogoScale }] },
              ]}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View
            style={{ opacity, transform: [{ translateY: offset }] }}
          >
            {children}
          </Animated.View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  pullLogoWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  pullLogo: {
    width: 44,
    height: 44,
  },
});
