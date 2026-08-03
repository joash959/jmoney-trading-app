import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, gradients } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import MenuRow from '../components/MenuRow';
import SectionLabel from '../components/SectionLabel';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'More'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MoreScreen({ navigation }: Props) {
  const handleSignOut = () => {
    navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScreenShell>
      <TopBar
        rightElement={
          <View style={styles.bellButton}>
            <Feather name="bell" size={18} color={colors.text} />
          </View>
        }
      />

      <View style={styles.profileCard}>
        <LinearGradient colors={gradients.brand} style={styles.avatar}>
          <Text style={styles.avatarText}>JO</Text>
        </LinearGradient>
        <View>
          <Text style={styles.profileName}>Jojo Jono</Text>
          <Text style={styles.profileEmail}>2123@1234.com</Text>
        </View>
      </View>

      <SectionLabel>MAIN MENU</SectionLabel>
      <View style={styles.section}>
        <MenuRow
          icon="grid"
          label="Dashboard"
          onPress={() => navigation.navigate('Home')}
        />
        <MenuRow
          icon="book-open"
          label="Courses"
          onPress={() => navigation.navigate('Courses')}
        />
        <MenuRow
          icon="zap"
          label="Trade Alerts"
          onPress={() => navigation.navigate('Alerts')}
        />
        <MenuRow icon="target" label="AI Super Scanner" />
        <MenuRow icon="sliders" label="Telegram Channels" />
        <MenuRow
          icon="video"
          label="Live Sessions"
          onPress={() => navigation.navigate('Live')}
        />
      </View>

      <SectionLabel>TRADING TOOLS</SectionLabel>
      <View style={styles.section}>
        <MenuRow icon="bookmark" label="Trading Journal" />
        <MenuRow icon="briefcase" label="Recommended Broker" />
        <MenuRow icon="bar-chart-2" label="Market Analysis" />
        <MenuRow icon="award" label="Leaderboard" />
      </View>

      <SectionLabel>ACCOUNT</SectionLabel>
      <View style={styles.section}>
        <MenuRow icon="bell" label="Notifications" />
        <MenuRow icon="phone" label="Contact Us" />
      </View>

      <View style={styles.signOutSection}>
        <MenuRow icon="log-out" label="Sign Out" destructive onPress={handleSignOut} />
      </View>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(47,111,239,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(78,140,255,0.3)',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  profileName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  profileEmail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginTop: 6,
  },
  signOutSection: {
    marginTop: 12,
    marginBottom: 8,
  },
});
