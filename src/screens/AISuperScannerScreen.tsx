import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { MainTabParamList, MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { parseFunctionError } from '../lib/functionError';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import AccentCard from '../components/AccentCard';
import Pill from '../components/Pill';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import UploadDropzone from '../components/UploadDropzone';
import EmptyStateCard from '../components/EmptyStateCard';

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
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ChartAnalysis | null>(null);

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
        icon="target"
        image={require('../../assets/aiscanner.png')}
        title="AI Super Scanner"
      />

      {!isPremium ? (
        <EmptyStateCard
          icon="lock"
          title="Premium Feature"
          subtitle="Connect and fund your PrimeXBT account to unlock the AI Super Scanner."
          buttonLabel="Go to Home"
          onPress={() => tabNavigation?.navigate('Home')}
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
                icon="image"
                onPress={handlePick}
                style={styles.actionButton}
              />
              <PrimaryButton
                label={scanning ? 'Scanning...' : 'Scan Chart'}
                icon="target"
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
          icon="alert-triangle"
          title="Couldn't read that chart"
          subtitle="Try a clearer screenshot with visible price and levels."
          buttonLabel="Try Again"
          onPress={handleReset}
          style={styles.cardSpaced}
        />
      )}

      {analysis && analysis.valid && (
        <>
          <AccentCard style={styles.cardSpaced}>
            <View style={styles.resultHeaderRow}>
              <View>
                <Text style={styles.instrument}>{analysis.instrument}</Text>
                <Text style={styles.timeframe}>{analysis.timeframe}</Text>
              </View>
              <View style={styles.pillColumn}>
                <Pill
                  label={analysis.trend.toUpperCase()}
                  color={TREND_COLOR[analysis.trend]}
                />
                <Pill
                  label={`${analysis.bias.toUpperCase()} · ${analysis.confidence}`}
                  color={BIAS_COLOR[analysis.bias]}
                />
              </View>
            </View>

            <View style={styles.levelsRow}>
              <View style={styles.levelsCol}>
                <Text style={styles.levelsLabel}>SUPPORT</Text>
                {analysis.support_levels.map((level, i) => (
                  <Text key={i} style={[styles.levelValue, styles.supportValue]}>
                    {level}
                  </Text>
                ))}
              </View>
              <View style={styles.levelsCol}>
                <Text style={styles.levelsLabel}>RESISTANCE</Text>
                {analysis.resistance_levels.map((level, i) => (
                  <Text key={i} style={[styles.levelValue, styles.resistanceValue]}>
                    {level}
                  </Text>
                ))}
              </View>
            </View>
          </AccentCard>

          <GlassCard style={styles.cardSpaced}>
            <Text style={styles.sectionTitle}>Trade Plan</Text>
            <View style={styles.planGrid}>
              <View style={styles.planCell}>
                <Text style={styles.planLabel}>Entry</Text>
                <Text style={styles.planValue}>
                  {analysis.trade_plan.entry}
                </Text>
              </View>
              <View style={styles.planCell}>
                <Text style={styles.planLabel}>Stop Loss</Text>
                <Text style={styles.planValue}>
                  {analysis.trade_plan.stop_loss}
                </Text>
              </View>
              <View style={styles.planCell}>
                <Text style={styles.planLabel}>Take Profit 1</Text>
                <Text style={styles.planValue}>
                  {analysis.trade_plan.take_profit_1}
                </Text>
              </View>
              <View style={styles.planCell}>
                <Text style={styles.planLabel}>Take Profit 2</Text>
                <Text style={styles.planValue}>
                  {analysis.trade_plan.take_profit_2}
                </Text>
              </View>
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
                <Feather
                  name="alert-triangle"
                  size={14}
                  color={colors.accentRed}
                />
                <Text style={styles.warningText}>{analysis.warnings}</Text>
              </View>
            )}
          </GlassCard>

          <SecondaryButton
            label="Scan Another Chart"
            icon="rotate-ccw"
            onPress={handleReset}
            style={styles.cardSpaced}
          />
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  dropzone: {
    marginTop: 24,
  },
  cardSpaced: {
    marginTop: 20,
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
    textAlign: 'center',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  pillColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 18,
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
  levelValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  supportValue: {
    color: colors.accentGreen,
  },
  resistanceValue: {
    color: colors.accentRed,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 12,
  },
  planCell: {
    width: '47%',
  },
  planLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  planValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  rrRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  reasoningText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  warningRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  warningText: {
    flex: 1,
    color: colors.accentRed,
    fontSize: 12,
    lineHeight: 17,
  },
});
