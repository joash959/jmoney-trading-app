import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import FormInput from './FormInput';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  clientId: string;
  onChangeClientId: (text: string) => void;
  onConnect: () => void;
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
};

export default function PrimeXBTConnectModal({
  visible,
  onClose,
  clientId,
  onChangeClientId,
  onConnect,
  loading,
  successMessage,
  errorMessage,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.headerRow}>
              <View style={styles.cardHeadingRow}>
                <Ionicons name="shield-outline" size={18} color={colors.text} />
                <Text style={styles.title}>Connect your PrimeXBT account</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close-outline" size={22} color={colors.textFaint} />
              </Pressable>
            </View>

            <Text style={styles.description}>
              Enter your PrimeXBT client ID or MT5 account number to unlock
              premium features instantly. Your account needs a minimum
              deposit of R500.
            </Text>

            <FormInput
              label="PRIMEXBT CLIENT ID"
              value={clientId}
              onChangeText={onChangeClientId}
              placeholder="e.g. 2629398"
              keyboardType="number-pad"
              containerStyle={styles.fieldSpaced}
            />
            <Text style={styles.helperText}>
              Use your <Text style={styles.helperBold}>PrimeXBT client ID</Text>{' '}
              (7 digits, usually starting with 26), found in the PrimeXBT app
              under Profile / Account settings. MT5 account numbers often
              aren't listed on our partner report, so they may not be
              recognised.
            </Text>

            {successMessage && (
              <Text style={styles.successText}>{successMessage}</Text>
            )}
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <PrimaryButton
              label={loading ? 'Checking...' : 'Connect & unlock premium'}
              icon="shield-outline"
              variant="flat"
              disabled={clientId.trim().length === 0 || loading}
              onPress={onConnect}
              style={styles.fieldSpaced}
            />
            <SecondaryButton
              label="Don't have an account? Open & fund PrimeXBT"
              icon="open-outline"
              onPress={() =>
                Linking.openURL(
                  'https://go.primexbt.direct/visit/?bta=53738&brand=primexbt'
                )
              }
              style={styles.fieldSpaced}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  fieldSpaced: {
    marginTop: 16,
  },
  helperText: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  helperBold: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  successText: {
    color: colors.accentGreen,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
  },
});
