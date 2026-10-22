import { StyleProp, StyleSheet, TextStyle } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';
import { sentenceCase } from '../lib/textCase';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
};

/** Section title above a group of cards, e.g. "Watchlist" in the references. */
export default function SectionLabel({ children, style }: Props) {
  return <Text style={[styles.label, style]}>{sentenceCase(children)}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 2,
  },
});
