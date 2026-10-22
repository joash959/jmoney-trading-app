// Near-black "glass" theme: cards are translucent with a hairline edge so
// the background light streaks glow through them, accents are the JMONEY
// logo's violet-to-blue.
export const colors = {
  background: '#08080B',
  // Solid fills - for sheets/modals and anything that must hide what's
  // underneath it.
  surface: '#111116',
  surfaceAlt: '#1A1A21',
  surfaceTrack: 'rgba(255,255,255,0.08)',
  buttonSecondary: 'rgba(255,255,255,0.07)',
  buttonSecondaryPressed: 'rgba(255,255,255,0.12)',

  // Translucent glass - every card in the app.
  card: 'rgba(22,22,30,0.72)',
  cardBorder: 'rgba(255,255,255,0.07)',
  cardBorderTop: 'rgba(255,255,255,0.12)',
  // Tiles and chips sitting on top of a card.
  glassTile: 'rgba(255,255,255,0.05)',
  surfaceElevated: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.14)',
  inputBackground: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(5,5,8,0.8)',

  text: '#FFFFFF',
  textMuted: '#B3B3BF',
  textFaint: '#6F6F7C',

  accentBlue: '#6C63FF',
  accentBlueDim: 'rgba(108,99,255,0.16)',
  accentPurple: '#A78BFA',
  accentGreen: '#2EE6A6',
  accentRed: '#FF4D6A',
  warning: '#F5C518',
  warningDim: 'rgba(245,197,24,0.14)',
  link: '#9D97FF',
};

export const gradients = {
  brand: ['#8B5CF6', '#4F7CFF'] as const,
  button: ['#7B61FF', '#4F6BFF'] as const,
  premiumGlow: ['rgba(124,58,237,0.35)', 'rgba(47,111,239,0)'] as const,
  // Hero / featured cards: a faint violet wash over glass.
  heroCard: ['rgba(123,97,255,0.22)', 'rgba(79,107,255,0.06)', 'rgba(22,22,30,0.6)'] as const,
  // Top-left sheen on every glass card.
  glassSheen: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'] as const,
  whatsapp: ['#34D399', '#128C7E'] as const,
  telegram: ['#7B61FF', '#4F6BFF'] as const,
};
