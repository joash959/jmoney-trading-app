import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function DisclaimerCard({ style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <Feather name="alert-triangle" size={16} color={colors.textFaint} />
      <Text style={styles.text}>
        <Text style={styles.bold}>Disclaimer: </Text>
        Representative of FSP No. 53590. Market observations and content
        shared are for educational and entertainment purposes only and do
        not constitute financial advice. Trading in financial markets
        involves risk and may result in the loss of some or all of your
        capital. Past performance is not indicative of future results.
        Always consult your own financial advisor before making any trading
        or investment decisions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    ...shadows.sm,
  },
  text: {
    flex: 1,
    color: colors.textFaint,
    fontSize: 11,
    lineHeight: 16,
  },
  bold: {
    fontWeight: '700',
    color: colors.textMuted,
  },
});
