import { Dimensions, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { MainTabParamList, MoreStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import SurfaceCard from '../components/SurfaceCard';
import IconTile, { iconTileGradients } from '../components/IconTile';
import MenuRow from '../components/MenuRow';
import SectionLabel from '../components/SectionLabel';
import DisclaimerCard from '../components/DisclaimerCard';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreHome'>;

// ScreenShell's scroll content padding (20/side) + SurfaceCard's own
// padding (spacing.lg = 20/side) eaten out of the screen width, so
// percentage-based tile widths can't be trusted to land on exact row
// counts - compute pixel widths instead so rows never wrap unexpectedly.
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_WIDTH = SCREEN_WIDTH - 20 * 2 - spacing.lg * 2;
const TILE_GAP = spacing.md;

function tileWidth(columns: number) {
  return (GRID_WIDTH - TILE_GAP * (columns - 1)) / columns;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function MoreScreen({ navigation }: Props) {
  const { session, profile, isPremium, signOut } = useAuth();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

  const email = session?.user.email ?? '';
  const displayName = profile?.display_name || email || 'Trader';

  const handleSignOut = () => {
    signOut();
    // RootNavigator swaps back to the Login stack automatically once
    // the session clears - no manual navigation needed here.
  };

  const mainMenu = [
    {
      icon: 'grid' as const,
      label: 'Dashboard',
      gradient: iconTileGradients.blue,
      image: require('../../assets/dashboard.png'),
      onPress: () => tabNavigation?.navigate('Home'),
    },
    {
      icon: 'book-open' as const,
      label: 'Courses',
      gradient: iconTileGradients.blue,
      image: require('../../assets/courses.png'),
      onPress: () =>
        tabNavigation?.navigate('Courses', { screen: 'CoursesHome' }),
    },
    {
      icon: 'zap' as const,
      label: 'Trade Alerts',
      gradient: iconTileGradients.gold,
      image: require('../../assets/tradealerts.png'),
      onPress: () => tabNavigation?.navigate('Alerts'),
    },
    {
      icon: 'target' as const,
      label: 'AI Scanner',
      gradient: iconTileGradients.purple,
      image: require('../../assets/aiscanner.png'),
      onPress: () => navigation.navigate('AIScanner'),
    },
    {
      icon: 'send' as const,
      label: 'Telegram',
      gradient: iconTileGradients.teal,
      image: require('../../assets/telegram.png'),
      onPress: () => navigation.navigate('TelegramChannels'),
    },
    {
      icon: 'video' as const,
      label: 'Live Sessions',
      gradient: iconTileGradients.green,
      image: require('../../assets/livesessions.png'),
      onPress: () => tabNavigation?.navigate('Live'),
    },
  ];

  const tradingTools = [
    {
      icon: 'bookmark' as const,
      label: 'Journal',
      gradient: iconTileGradients.gold,
      image: require('../../assets/tradingjournal.png'),
      onPress: () => navigation.navigate('TradingJournal'),
    },
    {
      icon: 'briefcase' as const,
      label: 'Broker',
      gradient: iconTileGradients.green,
      image: require('../../assets/broker.png'),
      onPress: () => navigation.navigate('RecommendedBroker'),
    },
    {
      icon: 'bar-chart-2' as const,
      label: 'Market Analysis',
      gradient: iconTileGradients.blue,
      image: require('../../assets/marketanalysis.png'),
      onPress: () => navigation.navigate('MarketAnalysis'),
    },
  ];

  const account = [
    {
      icon: 'bell' as const,
      label: 'Notifications',
      gradient: iconTileGradients.teal,
      image: require('../../assets/notifications.png'),
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'phone' as const,
      label: 'Contact Us',
      gradient: iconTileGradients.purple,
      image: require('../../assets/contactus.png'),
      onPress: () => navigation.navigate('ContactUs'),
    },
    {
      icon: 'award' as const,
      label: 'Leaderboard',
      gradient: iconTileGradients.red,
      image: require('../../assets/leaderboard.png'),
      onPress: () => navigation.navigate('Leaderboard'),
    },
  ];

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

      <SurfaceCard style={styles.profileCard}>
        <LinearGradient colors={gradients.brand} style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </LinearGradient>
        <View style={styles.profileTextWrap}>
          <Text style={styles.profileName}>{displayName}</Text>
          {!!email && <Text style={styles.profileEmail}>{email}</Text>}
        </View>
        <View style={styles.tierPill}>
          <Feather
            name={isPremium ? 'award' : 'lock'}
            size={11}
            color={isPremium ? colors.warning : colors.textFaint}
          />
          <Text
            style={[styles.tierPillText, isPremium && styles.tierPillTextPremium]}
          >
            {isPremium ? 'PREMIUM' : 'FREE'}
          </Text>
        </View>
      </SurfaceCard>

      <SectionLabel style={styles.headingWhite}>MAIN MENU</SectionLabel>
      <SurfaceCard style={styles.sectionCard}>
        <View style={styles.grid}>
          {mainMenu.map((item) => (
            <IconTile
              key={item.label}
              icon={item.icon}
              label={item.label}
              gradient={item.gradient}
              image={item.image}
              onPress={item.onPress}
              style={{ width: tileWidth(3) }}
            />
          ))}
        </View>
      </SurfaceCard>

      <SectionLabel style={styles.headingWhite}>TRADING TOOLS</SectionLabel>
      <SurfaceCard style={styles.sectionCard}>
        <View style={styles.grid}>
          {tradingTools.map((item) => (
            <IconTile
              key={item.label}
              icon={item.icon}
              label={item.label}
              gradient={item.gradient}
              image={item.image}
              onPress={item.onPress}
              style={{ width: tileWidth(3) }}
            />
          ))}
        </View>
      </SurfaceCard>

      <SectionLabel style={styles.headingWhite}>ACCOUNT</SectionLabel>
      <SurfaceCard style={styles.sectionCard}>
        <View style={styles.grid}>
          {account.map((item) => (
            <IconTile
              key={item.label}
              icon={item.icon}
              label={item.label}
              gradient={item.gradient}
              image={item.image}
              onPress={item.onPress}
              style={{ width: tileWidth(3) }}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.signOutCard}>
        <MenuRow icon="log-out" label="Sign Out" destructive onPress={handleSignOut} />
      </SurfaceCard>

      <DisclaimerCard style={styles.disclaimerSpaced} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  profileTextWrap: {
    flex: 1,
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
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surfaceAlt,
  },
  tierPillText: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tierPillTextPremium: {
    color: colors.warning,
  },
  sectionCard: {
    marginTop: 6,
  },
  headingWhite: {
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: TILE_GAP,
    rowGap: 18,
  },
  signOutCard: {
    marginTop: 20,
    marginBottom: 8,
    padding: spacing.md,
  },
  disclaimerSpaced: {
    marginTop: 4,
  },
});
