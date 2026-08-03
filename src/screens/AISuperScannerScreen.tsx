import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import UploadDropzone from '../components/UploadDropzone';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'AIScanner'>;

export default function AISuperScannerScreen({}: Props) {
  const handleUpload = () => {
    // TODO: wire up image picker + AI chart analysis
  };

  return (
    <ScreenShell overlay={<FloatingChatButton />}>
      <TopBar
        rightElement={
          <View style={styles.bellButton}>
            <Feather name="bell" size={18} color={colors.text} />
          </View>
        }
      />

      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Feather name="target" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>AI Super Scanner</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Upload any chart and let AI mark key levels, call the trend, and
        hand you a kill plan.
      </Text>

      <UploadDropzone
        title="Tap to upload chart"
        subtitle="PNG, JPG up to 8MB"
        onPress={handleUpload}
        style={styles.dropzone}
      />

      <DisclaimerCard style={styles.cardSpaced} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    flexShrink: 1,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  dropzone: {
    marginTop: 24,
  },
  cardSpaced: {
    marginTop: 20,
  },
});
