export const radius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 14,
  '2xl': 18,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
