import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { NotificationRow } from '../types/database';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import ScreenHeader from '../components/ScreenHeader';
import EmptyStateCard from '../components/EmptyStateCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'Notifications'>;

const TYPE_ICON: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  premium_unlocked: 'shield',
  session_reminder: 'video',
  telegram_access: 'send',
};

function iconForType(type: string) {
  return TYPE_ICON[type] ?? 'bell';
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen({}: Props) {
  const { session } = useAuth();
  const { refetch: refetchCount } = useUnreadNotificationsCount();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    setNotifications((data as NotificationRow[]) ?? []);
  }, [session]);

  useEffect(() => {
    fetchNotifications().then(() => setLoading(false));
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handlePressNotification = async (notification: NotificationRow) => {
    if (notification.read) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id);
    refetchCount();
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);
    refetchCount();
  };

  return (
    <ScreenShell
      overlay={<FloatingChatButton />}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <TopBar />

      <ScreenHeader icon="bell" title="Notifications" />

      {unreadCount > 0 && (
        <Pressable style={styles.markAllRow} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>
            Mark all as read ({unreadCount})
          </Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator
          color={colors.accentBlue}
          style={styles.cardSpaced}
        />
      ) : notifications.length === 0 ? (
        <EmptyStateCard
          icon="bell"
          iconVariant="plain"
          title="No notifications yet"
          subtitle="We'll let you know when something needs your attention."
          style={styles.cardSpaced}
        />
      ) : (
        <View style={[styles.list, styles.cardSpaced]}>
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              style={[
                styles.row,
                !notification.read && styles.rowUnread,
              ]}
              onPress={() => handlePressNotification(notification)}
            >
              <View style={styles.rowIcon}>
                <Feather
                  name={iconForType(notification.type)}
                  size={18}
                  color={colors.link}
                />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{notification.title}</Text>
                <Text style={styles.rowMessage}>{notification.message}</Text>
                <Text style={styles.rowTime}>
                  {formatRelativeTime(notification.created_at)}
                </Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </Pressable>
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  markAllRow: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  markAllText: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '700',
  },
  cardSpaced: {
    marginTop: 20,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 14,
  },
  rowUnread: {
    borderColor: 'rgba(78,140,255,0.35)',
    backgroundColor: 'rgba(47,111,239,0.08)',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowMessage: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  rowTime: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentBlue,
    marginTop: 4,
  },
});
