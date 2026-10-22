import { StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { LinearGradient } from 'expo-linear-gradient';
import { MoreStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { usePrimeXBTConnect } from '../hooks/usePrimeXBTConnect';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import NotificationBell from '../components/NotificationBell';
import SurfaceCard from '../components/SurfaceCard';
import IconTile from '../components/IconTile';
import MenuRow from '../components/MenuRow';
import SectionLabel from '../components/SectionLabel';
import ListRow from '../components/ListRow';
import DisclaimerCard from '../components/DisclaimerCard';
import PrimeXBTConnectModal from '../components/PrimeXBTConnectModal';
import BadgeGrid from '../components/BadgeGrid';
import { useGameStats } from '../hooks/useGameStats';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreHome'>;

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
  const connect = usePrimeXBTConnect();
  const { stats: gameStats, refresh: refreshGame } = useGameStats();
  useFocusEffect(
    useCallback(() => {
      refreshGame();
    }, [refreshGame])
  );
  const { count: unreadCount } = useUnreadNotificationsCount();

  const email = session?.user.email ?? '';
  const displayName = profile?.display_name || email || 'Trader';

  const handleSignOut = () => {
    signOut();
    // RootNavigator swaps back to the Login stack automatically once
    // the session clears - no manual navigation needed here.
  };

  // Only what the tab bar doesn't already reach.
  const shortcuts = [
    { icon: 'create-outline' as const, label: 'Journal', onPress: () => navigation.navigate('TradingJournal') },
    { icon: 'scan-outline' as const, label: 'Scanner', onPress: () => navigation.navigate('AIScanner') },
    { icon: 'stats-chart-outline' as const, label: 'Analysis', onPress: () => navigation.navigate('MarketAnalysis') },
    { icon: 'trophy-outline' as const, label: 'Ranks', onPress: () => navigation.navigate('Leaderboard') },
  ];

  const accountRows = [
    { icon: 'paper-plane-outline' as const, title: 'Telegram channels', subtitle: 'Trade alerts and community', onPress: () => navigation.navigate('TelegramChannels') },
    {
      icon: (isPremium ? 'checkmark-circle-outline' : 'link-outline') as 'checkmark-circle-outline' | 'link-outline',
      title: 'PrimeXBT account',
      subtitle: isPremium ? 'Connected · verified and funded' : 'Not connected - tap to connect',
      onPress: connect.open,
    },
    { icon: 'notifications-outline' as const, title: 'Notifications', subtitle: unreadCount > 0 ? `${unreadCount} unread` : 'All caught up', onPress: () => navigation.navigate('Notifications') },
    { icon: 'briefcase-outline' as const, title: 'Recommended broker', subtitle: 'PrimeXBT account and benefits', onPress: () => navigation.navigate('RecommendedBroker') },
    { icon: 'chatbubbles-outline' as const, title: 'Contact us', subtitle: 'WhatsApp, Telegram or email', onPress: () => navigation.navigate('ContactUs') },
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

      <View style={styles.profileCard}>
        <LinearGradient colors={gradients.brand} style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </LinearGradient>
        <View style={styles.profileTextWrap}>
          <Text style={styles.profileName} numberOfLines={1}>
            {displayName}
          </Text>
          {!!email && (
            <Text style={styles.profileEmail} numberOfLines={1}>
              {email}
            </Text>
          )}
          <View style={[styles.tierPill, isPremium && styles.tierPillPremium]}>
            <Ionicons
              name={isPremium ? 'diamond-outline' : 'lock-closed-outline'}
              size={11}
              color={isPremium ? colors.warning : colors.textFaint}
            />
            <Text
              style={[styles.tierPillText, isPremium && styles.tierPillTextPremium]}
            >
              {isPremium ? 'Premium member' : 'Free plan'}
              {gameStats ? ` · Lvl ${gameStats.level} ${gameStats.levelName}` : ''}
            </Text>
          </View>
        </View>
      </View>

      {gameStats && (
        <>
          <View style={styles.achievementsHeader}>
            <SectionLabel style={styles.noTopMargin}>Achievements</SectionLabel>
            <Text numeric style={styles.achievementsCount}>
              {gameStats.badges.filter((b) => b.unlocked).length}/{gameStats.badges.length}
            </Text>
          </View>
          <BadgeGrid badges={gameStats.badges} />
        </>
      )}

      <SectionLabel>Shortcuts</SectionLabel>
      <View style={styles.grid}>
        {shortcuts.map((item) => (
          <IconTile
            key={item.label}
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
          />
        ))}
      </View>

      <SectionLabel>Account</SectionLabel>
      <SurfaceCard style={styles.listCard}>
        {accountRows.map((row) => (
          <ListRow
            key={row.title}
            icon={row.icon}
            title={row.title}
            subtitle={row.subtitle}
            onPress={row.onPress}
            chevron
          />
        ))}
        <MenuRow icon="log-out-outline" label="Sign out" destructive onPress={handleSignOut} />
      </SurfaceCard>

      <DisclaimerCard style={styles.disclaimerSpaced} />

      <PrimeXBTConnectModal
        visible={connect.visible}
        onClose={connect.close}
        clientId={connect.clientId}
        onChangeClientId={connect.setClientId}
        onConnect={connect.handleConnect}
        loading={connect.loading}
        successMessage={connect.successMessage}
        errorMessage={connect.errorMessage}
        title={isPremium ? 'Connect a different PrimeXBT account' : undefined}
        description={
          isPremium
            ? "You're already connected and funded. Enter a different PrimeXBT client ID to switch accounts."
            : undefined
        }
        confirmLabel={isPremium ? 'Connect different account' : undefined}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 10,
  },
  noTopMargin: {
    marginTop: 0,
  },
  achievementsCount: {
    color: colors.link,
    fontSize: 15,
    fontWeight: '600',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    padding: 20,
    borderRadius: radius['2xl'],
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  profileEmail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  tierPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    backgroundColor: colors.glassTile,
  },
  tierPillPremium: {
    backgroundColor: colors.warningDim,
  },
  tierPillText: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  tierPillTextPremium: {
    color: colors.warning,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 10,
  },
  listCard: {
    marginTop: 10,
    paddingVertical: 4,
  },
  disclaimerSpaced: {
    marginTop: 20,
  },
});
