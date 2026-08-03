import { Easing } from 'react-native';

export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
};

export const easing = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
};

export const spring = {
  press: { useNativeDriver: true, speed: 50, bounciness: 0 },
  release: { useNativeDriver: true, speed: 30, bounciness: 6 },
  entrance: { useNativeDriver: true, speed: 14, bounciness: 8 },
};
