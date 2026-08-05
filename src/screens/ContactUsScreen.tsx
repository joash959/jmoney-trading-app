import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { MoreStackParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';

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
        icon="phone"
        image={require('../../assets/contactus.png')}
        title="Contact Us"
      />

      <Text style={styles.intro}>
        Our team is here to help with anything trading, account, or app
        related. Reach out on whichever channel works best for you.
      </Text>

      <Pressable
        onPress={() => Linking.openURL(WHATSAPP_URL)}
        style={({ pressed }) => [styles.cardSpaced, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={gradients.whatsapp}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contactCard}
        >
          <View style={styles.contactIconCircle}>
            <Feather name="message-circle" size={22} color={colors.text} />
          </View>
          <View style={styles.contactTextWrap}>
            <Text style={styles.contactTitle}>WhatsApp</Text>
            <Text style={styles.contactDescription}>
              Chat with our support team directly.
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color={colors.text} />
        </LinearGradient>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('TelegramChannels')}
        style={({ pressed }) => [styles.cardSpaced, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={gradients.telegram}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contactCard}
        >
          <View style={styles.contactIconCircle}>
            <Feather name="send" size={22} color={colors.text} />
          </View>
          <View style={styles.contactTextWrap}>
            <Text style={styles.contactTitle}>Telegram</Text>
            <Text style={styles.contactDescription}>
              Join our channels for alerts and updates.
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color={colors.text} />
        </LinearGradient>
      </Pressable>

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.rowHeader}>
          <View style={styles.iconCircle}>
            <Feather name="mail" size={20} color={colors.link} />
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
            <Feather name="send" size={15} color={colors.text} />
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
  pressed: {
    opacity: 0.85,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.glow,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextWrap: {
    flex: 1,
  },
  contactTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  contactDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 3,
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
