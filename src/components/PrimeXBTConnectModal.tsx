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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import FormInput from './FormInput';
import PrimaryButton from './PrimaryButton';
import Icon3D, { Icon3DName } from './Icon3D';
import GlassSheen from './GlassSheen';

type Props = {
  visible: boolean;
  onClose: () => void;
  clientId: string;
  onChangeClientId: (text: string) => void;
  onConnect: () => void;
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  /** Overrides for an already-premium user reconnecting a different account. */
  title?: string;
  description?: string;
  confirmLabel?: string;
};

const AFFILIATE_LINK = 'https://go.primexbt.direct/visit/?bta=53738&brand=primexbt';

// What premium opens up - shown to members who are upgrading, not to
// premium members switching accounts.
const PERKS: { icon: Icon3DName; label: string }[] = [
  { icon: 'alerts', label: 'Trade alerts' },
  { icon: 'live', label: 'Live sessions' },
  { icon: 'crown', label: 'Premium channels' },
];

/** Bottom sheet that links a PrimeXBT client ID to unlock premium. */
export default function PrimeXBTConnectModal({
  visible,
  onClose,
  clientId,
  onChangeClientId,
  onConnect,
  loading,
  successMessage,
  errorMessage,
  title,
  description,
  confirmLabel = 'Connect & unlock premium',
}: Props) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const reconnecting = !!title;

  const openSupport = () => {
    onClose();
    navigation.navigate('More', { screen: 'TelegramChannels' });
  };

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
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
            onPress={() => {}}
          >
            <GlassSheen />
            <View style={styles.handle} />
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>

            <View style={styles.hero}>
              <Icon3D name={reconnecting ? 'link' : 'gem'} size={64} />
              <Text style={styles.title}>{title ?? 'Unlock Premium'}</Text>
              <Text style={styles.description}>
                {description ??
                  'Link your funded PrimeXBT account and premium switches on instantly.'}
              </Text>
            </View>

            {!reconnecting && (
              <>
                <View style={styles.perks}>
                  {PERKS.map((perk) => (
                    <View key={perk.label} style={styles.perk}>
                      <Icon3D name={perk.icon} size={30} />
                      <Text style={styles.perkLabel}>{perk.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.requirement}>
                  <Ionicons name="information-circle" size={16} color={colors.warning} />
                  <Text style={styles.requirementText}>
                    Requires a minimum deposit of <Text style={styles.requirementBold}>R500</Text>
                  </Text>
                </View>
              </>
            )}

            <FormInput
              label="PrimeXBT client ID"
              icon="person-circle-outline"
              value={clientId}
              onChangeText={onChangeClientId}
              placeholder="e.g. 2629398"
              keyboardType="number-pad"
              containerStyle={styles.field}
            />
            <Text style={styles.helperText}>
              7 digits, usually starting with 26. Find it in the PrimeXBT app
              under Profile → Account settings.
            </Text>

            {successMessage && (
              <View style={[styles.message, styles.messageSuccess]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.accentGreen} />
                <Text style={[styles.messageText, { color: colors.accentGreen }]}>
                  {successMessage}
                </Text>
              </View>
            )}
            {errorMessage && (
              <View style={[styles.message, styles.messageError]}>
                <Ionicons name="alert-circle" size={16} color={colors.accentRed} />
                <Text style={[styles.messageText, { color: colors.accentRed }]}>
                  {errorMessage}
                </Text>
              </View>
            )}

            <PrimaryButton
              label={loading ? 'Checking...' : confirmLabel}
              icon={null}
              loading={loading}
              disabled={clientId.trim().length === 0}
              onPress={onConnect}
              style={styles.button}
            />

            <Pressable
              onPress={() => Linking.openURL(AFFILIATE_LINK)}
              hitSlop={6}
              style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
            >
              <Text style={styles.linkMuted}>New to PrimeXBT? </Text>
              <Text style={styles.link}>Open & fund an account</Text>
              <Ionicons name="open-outline" size={14} color={colors.link} />
            </Pressable>

            <Pressable
              onPress={openSupport}
              hitSlop={6}
              style={({ pressed }) => [styles.supportRow, pressed && styles.pressed]}
            >
              <Ionicons name="paper-plane-outline" size={13} color={colors.textFaint} />
              <Text style={styles.supportText}>Need help? Contact support on Telegram</Text>
            </Pressable>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: 22,
    paddingTop: 10,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glassTile,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  hero: {
    alignItems: 'center',
    marginTop: 14,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  perks: {
    flexDirection: 'row',
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.glassTile,
  },
  perk: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  perkLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  requirementText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  requirementBold: {
    color: colors.warning,
    fontWeight: '700',
  },
  field: {
    marginTop: 18,
  },
  helperText: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  messageSuccess: {
    backgroundColor: 'rgba(46,230,166,0.1)',
  },
  messageError: {
    backgroundColor: 'rgba(255,77,106,0.1)',
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: 18,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  linkMuted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  link: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '600',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  supportText: {
    color: colors.textFaint,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
