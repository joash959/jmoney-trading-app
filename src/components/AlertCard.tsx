import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  relativeTime: string;
  message: string;
  timestamp: string;
};

export default function AlertCard({ relativeTime, message, timestamp }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Feather name="message-circle" size={16} color={colors.link} />
      </View>
      <View style={styles.body}>
        <Text style={styles.relativeTime}>{relativeTime}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    ...shadows.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  relativeTime: {
    color: colors.textFaint,
    fontSize: 12,
  },
  message: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  timestamp: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 8,
  },
});
