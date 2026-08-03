import { TextStyle } from 'react-native';

// Deliberately no fontFamily override: on iOS RN's default text font already
// is San Francisco, and on Android it's Roboto. That's the "designed by
// Apple" look for free - the scale below is what does the actual work.
export const typography: Record<string, TextStyle> = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 0.2 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: 0.2 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
  title3: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  headline: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  subhead: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  footnote: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: '700', letterSpacing: 0.6 },
};

export type TypographyToken = keyof typeof typography;
