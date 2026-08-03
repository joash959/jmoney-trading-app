import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
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
