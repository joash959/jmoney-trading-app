import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const LAST_SEEN_KEY = 'jmoney_last_seen_alerts_at';

type AlertsBadgeContextValue = {
  /** Trade alerts sent since the user last opened the Alerts tab. */
  unseenCount: number;
  markAlertsSeen: () => void;
};

const AlertsBadgeContext = createContext<AlertsBadgeContextValue | undefined>(
  undefined
);

export function AlertsBadgeProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [unseenCount, setUnseenCount] = useState(0);

  const fetchUnseenCount = useCallback(async () => {
    if (!session) {
      setUnseenCount(0);
      return;
    }

    let lastSeen = await AsyncStorage.getItem(LAST_SEEN_KEY);
    if (!lastSeen) {
      // No baseline yet (first-ever open) - start from now instead of
      // counting every historical alert as "unseen" and showing a huge
      // badge on a brand new install.
      lastSeen = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SEEN_KEY, lastSeen);
    }

    const { count } = await supabase
      .from('trade_alerts')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', lastSeen);
    setUnseenCount(count ?? 0);
  }, [session]);

  useEffect(() => {
    fetchUnseenCount();
  }, [fetchUnseenCount]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('trade_alerts_badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trade_alerts' },
        () => {
          setUnseenCount((count) => count + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const markAlertsSeen = useCallback(() => {
    AsyncStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setUnseenCount(0);
  }, []);

  return (
    <AlertsBadgeContext.Provider value={{ unseenCount, markAlertsSeen }}>
      {children}
    </AlertsBadgeContext.Provider>
  );
}

export function useAlertsBadge() {
  const context = useContext(AlertsBadgeContext);
  if (!context) {
    throw new Error('useAlertsBadge must be used within an AlertsBadgeProvider');
  }
  return context;
}
