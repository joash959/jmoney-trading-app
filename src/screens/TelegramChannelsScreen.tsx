import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import AccentCard from '../components/AccentCard';
import GlassCard from '../components/GlassCard';
import Pill from '../components/Pill';
import PrimaryButton from '../components/PrimaryButton';
import ChannelCard from '../components/ChannelCard';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'TelegramChannels'>;

const AMBER = '#F59E0B';

const CHANNELS = [
  {
    icon: 'sliders' as const,
    title: 'JMONEY Trade Alerts Channel',
    tagLabel: 'Trade Alerts',
    tagColor: colors.accentRed,
    tagBackground: 'rgba(239,68,68,0.12)',
    description: 'Follow real-time Trade Alerts on US30, NAS100 & GOLD',
    members: '1K',
  },
  {
    icon: 'zap' as const,
    title: 'NFP LIVE Trade Alert',
    titleColor: colors.link,
    tagLabel: 'NFP',
    tagColor: AMBER,
    tagBackground: 'rgba(245,158,11,0.12)',
    description:
      'Follow real-time NFP Trade Alert and Insights on US30, NAS100 & GOLD',
    members: '1K',
    featured: true,
  },
  {
    icon: 'message-circle' as const,
    title: 'Public FREE Community',
    tagLabel: 'Public',
    tagColor: colors.link,
    tagBackground: colors.accentBlueDim,
    description: 'Public FREE Community',
    members: '7.1K',
  },
  {
    icon: 'users' as const,
    title: 'DISCORD Channel',
    tagLabel: 'Discord',
    tagColor: colors.accentPurple,
    tagBackground: 'rgba(139,124,255,0.12)',
    description:
      'Our main community for general discussions, announcements, and networking with fellow traders.',
    members: '5.2K',
  },
];

export default function TelegramChannelsScreen({}: Props) {
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
          <Feather name="sliders" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Telegram Channels</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Join our Telegram channels for Trade Alerts.
      </Text>

      <AccentCard style={styles.cardSpaced}>
        <View style={styles.privateHeaderRow}>
          <View style={styles.privateTitleRow}>
            <Feather name="send" size={18} color={colors.link} />
            <Text style={styles.privateTitle}>Private members channel</Text>
          </View>
          <Pill label="Ready to restore" color={colors.link} />
        </View>
        <Text style={styles.description}>
          Live trade alerts and mentorship on Telegram — for funded members
          only.
        </Text>
        <PrimaryButton
          label="Join via Telegram bot"
          icon="refresh-cw"
          variant="flat"
          style={styles.fieldSpaced}
        />
      </AccentCard>

      {CHANNELS.map((channel) => (
        <ChannelCard key={channel.title} {...channel} />
      ))}

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.tipRow}>
          <View style={styles.tipIcon}>
            <Feather name="message-circle" size={18} color={colors.link} />
          </View>
          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>New to Telegram?</Text>
            <Text style={styles.tipDescription}>
              Download the Telegram app on your phone or desktop, then tap
              any community above to join. It's free and takes just a few
              seconds to get started!
            </Text>
          </View>
        </View>
      </GlassCard>

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
  },
  cardSpaced: {
    marginTop: 20,
  },
  privateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  privateTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  fieldSpaced: {
    marginTop: 18,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 14,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(47,111,239,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  tipDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
