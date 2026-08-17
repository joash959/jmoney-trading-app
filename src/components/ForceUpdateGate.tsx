import { Linking, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import PrimaryButton from './PrimaryButton';
import { useVersionGate } from '../hooks/useVersionGate';

/**
 * Full-screen, non-dismissible block shown when the installed native build
 * is older than the minimum version required (set via the
 * app_version_requirements table) - for changes that need a fresh store
 * download rather than an OTA update.
 */
export default function ForceUpdateGate() {
  const { blocked, storeUrl } = useVersionGate();

  if (!blocked) return null;

  return (
    <Modal visible transparent={false} animationType="fade">
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-download-outline" size={32} color={colors.link} />
          </View>
          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.subtitle}>
            A new version of JMONEY Trading Academy is available with
            important changes. Please update to keep using the app.
          </Text>
          {storeUrl && (
            <PrimaryButton
              label="Update Now"
              icon="open-outline"
              onPress={() => Linking.openURL(storeUrl)}
              style={styles.button}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.accentBlueDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    marginTop: 28,
    width: '100%',
  },
});
