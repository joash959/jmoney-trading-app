import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { useAppUpdates } from '../hooks/useAppUpdates';

/** Floating pill shown app-wide once a downloaded EAS Update is ready to apply. */
export default function UpdateBanner() {
  const { updateReady, applyUpdate } = useAppUpdates();

  if (!updateReady) return null;

  return (
    <SafeAreaView style={styles.wrap} pointerEvents="box-none" edges={['top']}>
      <Pressable
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
        onPress={applyUpdate}
      >
        <Ionicons name="cloud-download-outline" size={16} color={colors.text} />
        <Text style={styles.label}>Update available - tap to restart</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: colors.accentBlue,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadows.md,
  },
  pillPressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
