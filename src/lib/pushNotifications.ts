import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

// The token this phone registered, so sign-out can remove exactly it.
const TOKEN_KEY = 'jm_push_token';

// Android groups notifications into channels; trade alerts get their own,
// high-priority one (the server sends with channelId 'trade-alerts').
const ALERTS_CHANNEL = 'trade-alerts';

// Show alerts as a banner with sound even while the app is open.
// (Phones only - notifications don't exist on web.)
if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function easProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined
  );
}

/**
 * Asks for notification permission (once), gets this phone's Expo push token
 * and saves it against the signed-in member in push_device_tokens - the
 * table the send-push-notification edge function reads. Safe to call on
 * every sign-in; does nothing on simulators or before EAS is set up.
 */
export async function registerForPushNotifications(userId: string): Promise<void> {
  try {
    // Simulators and web can't receive remote pushes.
    if (Platform.OS === 'web' || !Device.isDevice) return;

    const projectId = easProjectId();
    if (!projectId) {
      console.warn('[push] No EAS projectId in app.json - run `npx eas init` to enable push.');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL, {
        name: 'Trade alerts & updates',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 150, 250],
      });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') return;

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    const { error } = await supabase.from('push_device_tokens').upsert(
      {
        user_id: userId,
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        device_id: Device.modelName ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' }
    );
    if (error) {
      console.warn('[push] Could not save device token:', error.message);
      return;
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.warn('[push] Registration failed:', err);
  }
}

/** Stops pushes to this phone for the member who is signing out. */
export async function unregisterPushNotifications(userId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return;
    await supabase.from('push_device_tokens').delete().eq('user_id', userId).eq('token', token);
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn('[push] Unregister failed:', err);
  }
}
