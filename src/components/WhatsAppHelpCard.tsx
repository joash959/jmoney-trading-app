import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

export default function WhatsAppHelpCard() {
  return (
    <Pressable style={styles.helpCard}>
      <View style={styles.helpIcon}>
        <Feather name="message-circle" size={16} color={colors.accentGreen} />
      </View>
      <Text style={styles.helpText}>
        Need help? <Text style={styles.helpLink}>WhatsApp us</Text>
      </Text>
      <Feather name="arrow-right" size={16} color={colors.accentGreen} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
    ...shadows.sm,
  },
  helpIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(37,211,102,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  helpLink: {
    color: colors.accentGreen,
    fontWeight: '700',
  },
});
