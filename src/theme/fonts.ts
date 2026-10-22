// Poppins for headings/display/buttons, Inter for body/labels/inputs.
export const fonts = {
  poppinsBold: 'Poppins_700Bold',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsMedium: 'Poppins_500Medium',
  interBold: 'Inter_700Bold',
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

  // Two steps lighter than the CSS weight asks for: the glass look wants
  // calm, geometric headings (Poppins Medium/SemiBold), not heavy ones.
  if (numeric >= 900) return fonts.poppinsBold;
  if (numeric >= 800) return fonts.poppinsSemiBold;
  if (numeric >= 700) return fonts.poppinsMedium;
  if (numeric >= 600) return fonts.interSemiBold;
  if (numeric >= 500) return fonts.interMedium;
  return fonts.interRegular;
}

/** Inter at the right weight for figures (prices, P&L, counts). Paired with
 * tabular digits so numbers line up in columns and don't jitter as they
 * change - the "financial" number style. */
export function numericFontForWeight(weight?: string | number | null): string {
  const numeric =
    typeof weight === 'number'
      ? weight
      : weight === 'bold'
        ? 700
        : parseInt(weight ?? '', 10) || 400;
  if (numeric >= 700) return fonts.interBold;
  if (numeric >= 600) return fonts.interSemiBold;
  if (numeric >= 500) return fonts.interMedium;
  return fonts.interRegular;
}
