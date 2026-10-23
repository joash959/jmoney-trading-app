import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import PageHeader from '../components/PageHeader';
import NotificationBell from '../components/NotificationBell';
import GlassCard from '../components/GlassCard';
import Icon3D, { Icon3DName } from '../components/Icon3D';

type Props = NativeStackScreenProps<MoreStackParamList, 'ContactUs'>;

const WHATSAPP_URL =
  'https://wa.me/27686784063?text=Hi%20JMONEY%2C%20I%20need%20help%20with%20my%20account.';
const EMAIL_URL = 'mailto:support@millionairementor.io';

const CHANNELS: { icon: Icon3DName; title: string; subtitle: string; url?: string }[] = [
  { icon: 'speech', title: 'WhatsApp', subtitle: 'Chat with our support team directly', url: WHATSAPP_URL },
  { icon: 'telegram', title: 'Telegram', subtitle: 'Join our channels for alerts and updates' },
  { icon: 'envelope', title: 'Email', subtitle: 'support@millionairementor.io', url: EMAIL_URL },
];

export default function ContactUsScreen({ navigation }: Props) {
  const { count: unreadCount } = useUnreadNotificationsCount();

  return (
    <ScreenShell>
      <PageHeader
        title="Contact us"
        onBack={() => navigation.goBack()}
        icon="speech"
        context="WhatsApp, Telegram or email"
        right={
          <NotificationBell
            count={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
          />
        }
      />

      <Text style={styles.intro}>
        Our team is here to help with anything trading, account, or app
        related. Reach out on whichever channel works best for you.
      </Text>

      <GlassCard style={[styles.cardSpaced, styles.listCard]}>
        {CHANNELS.map((channel, i) => (
          <Pressable
            key={channel.title}
            onPress={() =>
              channel.url ? Linking.openURL(channel.url) : navigation.navigate('TelegramChannels')
            }
            style={({ pressed }) => [
              styles.row,
              i > 0 && styles.rowDivider,
              pressed && styles.rowPressed,
            ]}
          >
            <Icon3D name={channel.icon} size={40} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{channel.title}</Text>
              <Text style={styles.rowDescription}>{channel.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  cardSpaced: {
    marginTop: 18,
  },
  listCard: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rowDescription: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
});
