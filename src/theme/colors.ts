// Neutral dark-gray ladder (PrimeXBT-style): each step reads as a clear,
// deliberate brightness bump from the one below it - not a blue-black tint.
export const colors = {
  background: '#131417',
  surface: '#17181C',
  surfaceAlt: '#202126',
  surfaceTrack: '#2B2C32',
  buttonSecondary: '#2B2C32',
  buttonSecondaryPressed: '#34353C',

  // Same solid fill as `surface`, no border - every card in the app should
  // render identically to the Home screen's "Your Progress" card.
  card: '#17181C',
  cardBorder: 'transparent',
  cardBorderTop: 'transparent',
  surfaceElevated: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.14)',
  inputBackground: '#1C1D22',
  inputBorder: 'rgba(255,255,255,0.1)',
  overlay: 'rgba(10,10,13,0.75)',

  text: '#FFFFFF',
  textMuted: '#D6D9DE',
  textFaint: '#8B8E96',

  accentBlue: '#2F6FEF',
  accentBlueDim: 'rgba(47,111,239,0.14)',
  accentPurple: '#8B7CFF',
  accentGreen: '#25D366',
  accentRed: '#EF4444',
  warning: '#F5C518',
  warningDim: 'rgba(245,197,24,0.14)',
  link: '#4E8CFF',
};

export const gradients = {
  brand: ['#7C3AED', '#2F6FEF'] as const,
  button: ['#3B82F6', '#2F6FEF'] as const,
  premiumGlow: ['rgba(124,58,237,0.35)', 'rgba(47,111,239,0)'] as const,
  whatsapp: ['#34D399', '#128C7E'] as const,
  telegram: ['#3B82F6', '#2F6FEF'] as const,
};
