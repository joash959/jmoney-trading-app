import { StyleProp, StyleSheet, TextStyle } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
};

export default function SectionLabel({ children, style }: Props) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 24,
  },
});
