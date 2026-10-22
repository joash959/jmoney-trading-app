import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { MoreStackParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import GradientLinkCard from '../components/GradientLinkCard';

type Props = NativeStackScreenProps<MoreStackParamList, 'ContactUs'>;

const WHATSAPP_URL =
  'https://wa.me/27686784063?text=Hi%20JMONEY%2C%20I%20need%20help%20with%20my%20account.';
const EMAIL_URL = 'mailto:support@millionairementor.io';

export default function ContactUsScreen({ navigation }: Props) {
  const { count: unreadCount } = useUnreadNotificationsCount();

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
        icon="call-outline"
        title="Contact us"
      />

      <Text style={styles.intro}>
        Our team is here to help with anything trading, account, or app
        related. Reach out on whichever channel works best for you.
      </Text>

      <GradientLinkCard
        icon="logo-whatsapp"
        title="WhatsApp"
        subtitle="Chat with our support team directly."
        gradient={['rgba(46,230,166,0.2)', 'rgba(46,230,166,0.04)', 'rgba(22,22,30,0.6)']}
        onPress={() => Linking.openURL(WHATSAPP_URL)}
        style={styles.cardSpaced}
      />

      <GradientLinkCard
        icon="paper-plane-outline"
        title="Telegram"
        subtitle="Join our channels for alerts and updates."
        onPress={() => navigation.navigate('TelegramChannels')}
        style={styles.cardSpaced}
      />

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.rowHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={20} color={colors.link} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Email</Text>
            <Text style={styles.rowDescription}>
              support@millionairementor.io
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.emailButton,
              pressed && styles.emailButtonPressed,
            ]}
            onPress={() => Linking.openURL(EMAIL_URL)}
          >
            <Ionicons name="paper-plane-outline" size={15} color={colors.text} />
          </Pressable>
        </View>
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  cardSpaced: {
    marginTop: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  rowDescription: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  emailButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButtonPressed: {
    opacity: 0.85,
  },
});
