import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { supabase } from '../lib/supabase';
import { isVersionBelow } from '../lib/versionCompare';

type VersionGateState = {
  checked: boolean;
  blocked: boolean;
  storeUrl: string | null;
};

/**
 * Checks the app_version_requirements table for the current platform's
 * minimum version. If the installed native build (not the OTA JS version -
 * this is specifically for changes that need a fresh store download) is
 * older than that, the app should show a blocking "update required" screen.
 */
export function useVersionGate() {
  const [state, setState] = useState<VersionGateState>({
    checked: false,
    blocked: false,
    storeUrl: null,
  });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const currentVersion = Application.nativeApplicationVersion;

      if (!currentVersion) {
        if (!cancelled) setState({ checked: true, blocked: false, storeUrl: null });
        return;
      }

      const { data, error } = await supabase
        .from('app_version_requirements')
        .select('minimum_version, store_url')
        .eq('platform', platform)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data?.minimum_version) {
        setState({ checked: true, blocked: false, storeUrl: null });
        return;
      }

      setState({
        checked: true,
        blocked: isVersionBelow(currentVersion, data.minimum_version),
        storeUrl: data.store_url ?? null,
      });
    };

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
