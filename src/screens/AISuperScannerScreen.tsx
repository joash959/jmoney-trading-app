import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import { parseFunctionError } from '../lib/functionError';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import Pill from '../components/Pill';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import UploadDropzone from '../components/UploadDropzone';
import EmptyStateCard from '../components/EmptyStateCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';

type Props = NativeStackScreenProps<MoreStackParamList, 'AIScanner'>;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type TradePlan = {
  entry: string;
  stop_loss: string;
  take_profit_1: string;
  take_profit_2: string;
  risk_reward: string;
};

type ChartAnalysis = {
  valid: boolean;
  instrument: string;
  timeframe: string;
  trend: 'bullish' | 'bearish' | 'ranging' | 'unknown';
  bias: 'long' | 'short' | 'wait';
  confidence: 'low' | 'medium' | 'high';
  support_levels: string[];
  resistance_levels: string[];
  trade_plan: TradePlan;
  reasoning: string;
  warnings: string;
};

const TREND_COLOR: Record<ChartAnalysis['trend'], string> = {
  bullish: colors.accentGreen,
  bearish: colors.accentRed,
  ranging: colors.link,
  unknown: colors.textFaint,
};

const BIAS_COLOR: Record<ChartAnalysis['bias'], string> = {
  long: colors.accentGreen,
  short: colors.accentRed,
  wait: colors.textFaint,
};

export default function AISuperScannerScreen({ navigation }: Props) {
  const { isPremium } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const connect = usePrimeXBTConnect();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ChartAnalysis | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, value: string) => {
    await Clipboard.setStringAsync(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
  };

  const handlePick = async () => {
    setPickError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPickError('Please allow photo library access to upload a chart.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      setPickError('Could not read that image. Please try another one.');
      return;
    }

    const approxBytes = Math.floor((asset.base64.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      setPickError('That image is over 8MB. Please choose a smaller file.');
      return;
    }

    const mime = asset.mimeType ?? 'image/jpeg';
    setImageUri(asset.uri);
    setImageDataUrl(`data:${mime};base64,${asset.base64}`);
    setAnalysis(null);
    setScanError(null);
  };

  const handleScan = async () => {
    if (!imageDataUrl) return;
    setScanning(true);
    setScanError(null);

    const { data, error } = await supabase.functions.invoke('ai-chart-scope', {
      body: { imageDataUrl },
    });

    setScanning(false);

    if (error) {
      setScanError(await parseFunctionError(error));
      return;
    }
    setAnalysis((data?.analysis as ChartAnalysis) ?? null);
  };

  const handleReset = () => {
    setImageUri(null);
    setImageDataUrl(null);
    setAnalysis(null);
    setScanError(null);
    setPickError(null);
  };

  return (
    <ScreenShell>
      <TopBar
        rightElement={
          <NotificationBell
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      <ScreenHeader
        icon="locate-outline"
        image={require('../../assets/aiscanner.png')}
        title="AI Super Scanner"
      />

      {!isPremium ? (
        <EmptyStateCard
          icon="lock-closed-outline"
          title="Premium Feature"
          subtitle="Connect and fund your PrimeXBT account to unlock the AI Super Scanner."
          buttonLabel="Connect PrimeXBT"
          onPress={connect.open}
          style={styles.cardSpaced}
        />
      ) : !imageUri ? (
        <UploadDropzone
          title="Tap to upload chart"
          subtitle="PNG, JPG up to 8MB"
          onPress={handlePick}
          style={styles.dropzone}
        />
      ) : (
        <GlassCard style={styles.cardSpaced}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          {!analysis && (
            <View style={styles.actionsRow}>
              <SecondaryButton
                label="Choose Different Image"
                icon="image-outline"
                onPress={handlePick}
                style={styles.actionButton}
              />
              <PrimaryButton
                label={scanning ? 'Scanning...' : 'Scan Chart'}
                icon="locate-outline"
                disabled={scanning}
                onPress={handleScan}
                style={styles.actionButton}
              />
            </View>
          )}
        </GlassCard>
      )}

      {pickError && <Text style={styles.errorText}>{pickError}</Text>}

      {scanning && (
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.cardSpaced}
        />
      )}
      {scanError && <Text style={styles.errorText}>{scanError}</Text>}

      {analysis && !analysis.valid && (
        <EmptyStateCard
          icon="warning-outline"
          title="Couldn't read that chart"
          subtitle="Try a clearer screenshot with visible price and levels."
          buttonLabel="Try Again"
          onPress={handleReset}
          style={styles.cardSpaced}
        />
      )}

      {analysis && analysis.valid && (
        <>
          <GlassCard style={styles.cardSpaced}>
            <View>
              <Text style={styles.instrument}>{analysis.instrument}</Text>
              <Text style={styles.timeframe}>{analysis.timeframe}</Text>
            </View>
            <View style={styles.pillRow}>
              <Pill
                label={analysis.trend.toUpperCase()}
                color={TREND_COLOR[analysis.trend]}
              />
              <Pill
                label={`${analysis.bias.toUpperCase()} · ${analysis.confidence}`}
                color={BIAS_COLOR[analysis.bias]}
              />
            </View>

            <View style={styles.levelsRow}>
              <View style={styles.levelsCol}>
                <Text style={styles.levelsLabel}>SUPPORT</Text>
                {analysis.support_levels.map((level, i) => {
                  const key = `support-${i}`;
                  const copied = copiedKey === key;
                  return (
                    <Pressable
                      key={key}
                      style={styles.levelValueRow}
                      onPress={() => handleCopy(key, level)}
                    >
                      <Text style={[styles.levelValue, styles.supportValue]}>
                        {level}
                      </Text>
                      <Ionicons
                        name={copied ? 'checkmark-outline' : 'copy-outline'}
                        size={12}
                        color={copied ? colors.accentGreen : colors.textFaint}
                      />
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.levelsCol}>
                <Text style={styles.levelsLabel}>RESISTANCE</Text>
                {analysis.resistance_levels.map((level, i) => {
                  const key = `resistance-${i}`;
                  const copied = copiedKey === key;
                  return (
                    <Pressable
                      key={key}
                      style={styles.levelValueRow}
                      onPress={() => handleCopy(key, level)}
                    >
                      <Text style={[styles.levelValue, styles.resistanceValue]}>
                        {level}
                      </Text>
                      <Ionicons
                        name={copied ? 'checkmark-outline' : 'copy-outline'}
                        size={12}
                        color={copied ? colors.accentGreen : colors.textFaint}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.cardSpaced}>
            <Text style={styles.sectionTitle}>Trade Plan</Text>
            <View style={styles.planRow}>
              <CopyablePlanCell
                label="Entry"
                value={analysis.trade_plan.entry}
                copied={copiedKey === 'entry'}
                onCopy={() => handleCopy('entry', analysis.trade_plan.entry)}
              />
              <CopyablePlanCell
                label="Stop Loss"
                value={analysis.trade_plan.stop_loss}
                copied={copiedKey === 'stop_loss'}
                onCopy={() => handleCopy('stop_loss', analysis.trade_plan.stop_loss)}
              />
            </View>
            <View style={styles.planRow}>
              <CopyablePlanCell
                label="Take Profit 1"
                value={analysis.trade_plan.take_profit_1}
                copied={copiedKey === 'tp1'}
                onCopy={() => handleCopy('tp1', analysis.trade_plan.take_profit_1)}
              />
              <CopyablePlanCell
                label="Take Profit 2"
                value={analysis.trade_plan.take_profit_2}
                copied={copiedKey === 'tp2'}
                onCopy={() => handleCopy('tp2', analysis.trade_plan.take_profit_2)}
              />
            </View>
            <View style={styles.rrRow}>
              <Text style={styles.planLabel}>Risk / Reward</Text>
              <Text style={styles.planValue}>
                {analysis.trade_plan.risk_reward}
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.cardSpaced}>
            <Text style={styles.sectionTitle}>Reasoning</Text>
            <Text style={styles.reasoningText}>{analysis.reasoning}</Text>
            {!!analysis.warnings && (
              <View style={styles.warningRow}>
                <Ionicons
                  name="warning-outline"
                  size={14}
                  color={colors.accentRed}
                />
                <Text style={styles.warningText}>{analysis.warnings}</Text>
              </View>
            )}
          </GlassCard>

          <SecondaryButton
            label="Scan Another Chart"
            icon="refresh-outline"
            onPress={handleReset}
            style={styles.cardSpaced}
          />
        </>
      )}

      <PrimeXBTConnectModal
        visible={connect.visible}
        onClose={connect.close}
        clientId={connect.clientId}
        onChangeClientId={connect.setClientId}
        onConnect={connect.handleConnect}
        loading={connect.loading}
        successMessage={connect.successMessage}
        errorMessage={connect.errorMessage}
      />
    </ScreenShell>
  );
}

type CopyablePlanCellProps = {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
};

function CopyablePlanCell({ label, value, copied, onCopy }: CopyablePlanCellProps) {
  return (
    <Pressable style={styles.planCell} onPress={onCopy}>
      <Text style={styles.planLabel}>{label}</Text>
      <View style={styles.planValueRow}>
        <Text style={styles.planValue}>{value}</Text>
        <Ionicons
          name={copied ? 'checkmark-outline' : 'copy-outline'}
          size={12}
          color={copied ? colors.accentGreen : colors.textFaint}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dropzone: {
    marginTop: spacing.xl,
  },
  cardSpaced: {
    marginTop: spacing.lg,
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radius.xl,
    backgroundColor: colors.inputBackground,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  instrument: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  timeframe: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  levelsCol: {
    flex: 1,
  },
  levelsLabel: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  levelValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xxs + 2,
  },
  levelValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  supportValue: {
    color: colors.accentGreen,
  },
  resistanceValue: {
    color: colors.accentRed,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  planRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  planCell: {
    flex: 1,
  },
  planLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  planValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  planValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rrRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  reasoningText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  warningRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  warningText: {
    flex: 1,
    color: colors.accentRed,
    fontSize: 12,
    lineHeight: 17,
  },
});
