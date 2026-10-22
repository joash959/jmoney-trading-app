import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Text from './AppText';
import Icon3D, { Icon3DName } from './Icon3D';
import PrimaryButton from './PrimaryButton';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import type { Badge } from '../lib/gamification';

const BURST: { icon: Icon3DName; angle: number }[] = [
  { icon: 'star', angle: -90 },
  { icon: 'gem', angle: -30 },
  { icon: 'star', angle: 30 },
  { icon: 'money-bag', angle: 90 },
  { icon: 'star', angle: 150 },
  { icon: 'gem', angle: 210 },
];

/** Celebration when a badge is newly unlocked: the badge pops in with a
 * burst of 3D sparkles around it. */
export default function BadgeUnlockedModal({
  badge,
  onClose,
}: {
  badge: Badge | null;
  onClose: () => void;
}) {
  const pop = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!badge) return;
    pop.setValue(0);
    burst.setValue(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 9, bounciness: 14 }),
      Animated.timing(burst, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [badge, pop, burst]);

  return (
    <Modal visible={!!badge} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.stage}>
            {BURST.map((b, i) => {
              const rad = (b.angle * Math.PI) / 180;
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.spark,
                    {
                      opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0.85] }),
                      transform: [
                        { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * 86] }) },
                        { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * 86] }) },
                        { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                      ],
                    },
                  ]}
                >
                  <Icon3D name={b.icon} size={28} />
                </Animated.View>
              );
            })}
            <Animated.View
              style={[
                styles.badgeHalo,
                {
                  transform: [
                    { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
                  ],
                  opacity: pop,
                },
              ]}
            >
              {badge && <Icon3D name={badge.icon} size={96} />}
            </Animated.View>
          </View>
          <Text style={styles.kicker}>Badge unlocked!</Text>
          <Text style={styles.title}>{badge?.title}</Text>
          <Text style={styles.description}>{badge?.description}</Text>
          <PrimaryButton label="Awesome" icon={null} onPress={onClose} style={styles.button} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,5,8,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius['2xl'],
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
  },
  stage: {
    width: 220,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
  },
  badgeHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(47,107,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    marginTop: 22,
    alignSelf: 'stretch',
  },
});
