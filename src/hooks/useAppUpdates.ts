import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';

/**
 * Checks for an EAS Update on mount and again whenever the app returns to
 * the foreground. expo-updates is a no-op in Expo Go / dev builds, so this
 * only ever finds anything in a production build published via `eas update`.
 */
export function useAppUpdates() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelled = false;

    const checkForUpdate = async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable || cancelled) return;
        await Updates.fetchUpdateAsync();
        if (!cancelled) setUpdateReady(true);
      } catch {
        // No network, no update channel configured yet, etc. - ignore.
      }
    };

    checkForUpdate();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyUpdate = () => {
    Updates.reloadAsync();
  };

  return { updateReady, applyUpdate };
}
