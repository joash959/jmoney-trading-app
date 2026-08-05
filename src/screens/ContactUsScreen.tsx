import { Linking, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import ScreenHeader from '../components/ScreenHeader';
import AccentCard from '../components/AccentCard';
import PrimaryButton from '../components/PrimaryButton';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'ContactUs'>;

const WHATSAPP_URL =
  'https://wa.me/27686784063?text=Hi%20JMONEY%2C%20I%20need%20help%20with%20my%20account.';
const EMAIL_URL = 'mailto:support@millionairementor.io';

export default function ContactUsScreen({ navigation }: Props) {
  const { count: unreadCount } = useUnreadNotificationsCount();

  return (
    <ScreenShell overlay={<FloatingChatButton />}>
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

      <AccentCard style={styles.cardSpaced}>
        <View style={styles.rowHeader}>
          <View style={styles.iconCircle}>
            <Feather name="message-circle" size={20} color={colors.accentGreen} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>WhatsApp</Text>
            <Text style={styles.rowDescription}>
              Chat with our support team directly.
            </Text>
          </View>
        </View>
        <PrimaryButton
          label="Message on WhatsApp"
          icon="message-circle"
          variant="flat"
          onPress={() => Linking.openURL(WHATSAPP_URL)}
          style={styles.fieldSpaced}
        />
      </AccentCard>

      <AccentCard style={styles.cardSpaced}>
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
        </View>
        <PrimaryButton
          label="Send an Email"
          icon="mail"
          variant="flat"
          onPress={() => Linking.openURL(EMAIL_URL)}
          style={styles.fieldSpaced}
        />
      </AccentCard>

      <DisclaimerCard style={styles.cardSpaced} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  cardSpaced: {
    marginTop: 20,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
  fieldSpaced: {
    marginTop: 16,
  },
});
