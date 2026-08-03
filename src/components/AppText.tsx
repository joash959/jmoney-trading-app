import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { fontFamilyForWeight } from '../theme/fonts';

/**
 * Drop-in replacement for RN's Text. Picks Poppins or Inter automatically
 * from whatever fontWeight the style already sets, and clears fontWeight
 * itself so the OS doesn't try to synthetically re-bold an already-bold
 * font file. Existing styles don't need to change.
 */
export default function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) as
    | (Record<string, unknown> & { fontFamily?: string; fontWeight?: string | number })
    | undefined;

  const fontFamily = flat?.fontFamily ?? fontFamilyForWeight(flat?.fontWeight);

  return (
    <RNText {...props} style={[style, { fontFamily, fontWeight: 'normal' }]} />
  );
}
