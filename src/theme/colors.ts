// Neutral near-black "glass" theme: charcoal translucent cards with a
// hairline edge. The JMONEY violet-to-blue is reserved for actions and
// active states (buttons, links, the selected tab) - surfaces stay neutral.
export const colors = {
  background: '#0A0A0D',
  // Solid fills - for sheets/modals and anything that must hide what's
  // underneath it.
  surface: '#111116',
  surfaceAlt: '#1A1A21',
  surfaceTrack: 'rgba(255,255,255,0.08)',
  buttonSecondary: 'rgba(255,255,255,0.07)',
  buttonSecondaryPressed: 'rgba(255,255,255,0.12)',

  // Translucent glass - every card in the app.
  card: 'rgba(26,26,32,0.62)',
  // Edgeless glass: cards and tiles have no outline. Kept as tokens so
  // every surface stays in sync if that ever changes.
  cardBorder: 'transparent',
  cardBorderTop: 'transparent',
  // Thin separators between rows inside a card (not card edges).
  divider: 'rgba(255,255,255,0.07)',
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
  link: '#A8A4FF',
};

export const gradients = {
  brand: ['#8B5CF6', '#4F7CFF'] as const,
  button: ['#7B61FF', '#4F6BFF'] as const,
  premiumGlow: ['rgba(124,58,237,0.35)', 'rgba(47,111,239,0)'] as const,
  // Hero / featured cards: a slightly brighter neutral glass, no tint.
  heroCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.025)', 'rgba(255,255,255,0.01)'] as const,
  // Top-left sheen on every glass card.
  glassSheen: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)'] as const,
  whatsapp: ['#34D399', '#128C7E'] as const,
  telegram: ['#7B61FF', '#4F6BFF'] as const,
};
