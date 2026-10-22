import { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { AuthProvider } from './src/contexts/AuthContext';
import { AlertsBadgeProvider } from './src/contexts/AlertsBadgeContext';
import RootNavigator from './src/navigation/RootNavigator';
import UpdateBanner from './src/components/UpdateBanner';
import ForceUpdateGate from './src/components/ForceUpdateGate';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const hideSplash = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AlertsBadgeProvider>
          <RootNavigator />
        </AlertsBadgeProvider>
      </AuthProvider>
      <UpdateBanner />
      <ForceUpdateGate />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
