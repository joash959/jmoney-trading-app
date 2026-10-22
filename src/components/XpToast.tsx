import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Text from './AppText';
import { colors, gradients } from '../theme/colors';
import Icon3D from './Icon3D';

export type XpToastHandle = { show: (amount: number, label?: string) => void };

/** Floating "+10 XP" reward that pops up, rises and fades. */
const XpToast = forwardRef<XpToastHandle>(function XpToast(_, ref) {
  const anim = useRef(new Animated.Value(0)).current;
  const [content, setContent] = useState({ amount: 0, label: '' });

  useImperativeHandle(ref, () => ({
    show: (amount, label = '') => {
      setContent({ amount, label });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      anim.setValue(0);
      Animated.sequence([
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }),
        Animated.delay(1100),
        Animated.timing(anim, { toValue: 2, duration: 350, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
    },
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity: anim.interpolate({ inputRange: [0, 0.4, 1, 2], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1, 2], outputRange: [30, 0, -30] }) },
            { scale: anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.7, 1, 0.95] }) },
          ],
        },
      ]}
    >
      <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill}>
        <Icon3D name="star" size={24} />
        <Text numeric style={styles.amount}>+{content.amount} XP</Text>
        {!!content.label && <Text style={styles.label}>{content.label}</Text>}
      </LinearGradient>
    </Animated.View>
  );
});

export default XpToast;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#2F6BFF',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  amount: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
});
