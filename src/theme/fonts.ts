// Poppins for headings/display/buttons, Inter for body/labels/inputs.
export const fonts = {
  poppinsExtraBold: 'Poppins_800ExtraBold',
  poppinsBold: 'Poppins_700Bold',
  poppinsSemiBold: 'Poppins_600SemiBold',
  interSemiBold: 'Inter_600SemiBold',
  interMedium: 'Inter_500Medium',
  interRegular: 'Inter_400Regular',
};

/** Picks the right weight-specific font file for a given CSS-style fontWeight. */
export function fontFamilyForWeight(weight?: string | number | null): string {
  const numeric =
    typeof weight === 'number'
      ? weight
      : weight === 'bold'
        ? 700
        : parseInt(weight ?? '', 10) || 400;

  if (numeric >= 800) return fonts.poppinsExtraBold;
  if (numeric >= 700) return fonts.poppinsBold;
  if (numeric >= 600) return fonts.interSemiBold;
  if (numeric >= 500) return fonts.interMedium;
  return fonts.interRegular;
}
