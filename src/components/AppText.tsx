import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { fontFamilyForWeight, numericFontForWeight } from '../theme/fonts';

type Props = TextProps & {
  /** Figures (prices, P&L, counts): Inter with tabular digits. */
  numeric?: boolean;
};

/**
 * Drop-in replacement for RN's Text. Picks Manrope or Inter automatically
 * from whatever fontWeight the style already sets, and clears fontWeight
 * itself so the OS doesn't try to synthetically re-bold an already-bold
 * font file. Existing styles don't need to change.
 */
export default function Text({ style, numeric, ...props }: Props) {
  const flat = StyleSheet.flatten(style) as
    | (Record<string, unknown> & { fontFamily?: string; fontWeight?: string | number })
    | undefined;

  const fontFamily =
    flat?.fontFamily ??
    (numeric ? numericFontForWeight(flat?.fontWeight) : fontFamilyForWeight(flat?.fontWeight));

  return (
    <RNText
      {...props}
      style={[
        style,
        { fontFamily, fontWeight: 'normal' },
        numeric && styles.tabular,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
