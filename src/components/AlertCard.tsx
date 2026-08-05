import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  message: string;
  time: string;
};

export default function AlertCard({ message, time }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.sender}>JMONEY Signals</Text>
        <Text style={styles.message}>
          {message}
          <Text style={styles.time}>{'  '}{time}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadows.sm,
  },
  sender: {
    color: colors.accentBlue,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  message: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '400',
  },
});
