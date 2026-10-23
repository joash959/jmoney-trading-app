import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  DarkTheme,
  NavigationContainer,
  Theme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import MainTabNavigator from './MainTabNavigator';
import { colors } from '../theme/colors';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accentBlue,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.cardBorder,
    notification: colors.accentBlue,
  },
};

export default function RootNavigator() {
  const { session, loading } = useAuth();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [navReady, setNavReady] = useState(false);

  // Tapping a trade-alert push opens the Alerts tab - including the tap that
  // launched the app. Phones only: notifications don't exist on web.
  useEffect(() => {
    if (Platform.OS === 'web' || !navReady || !session) return;
    const open = (response: Notifications.NotificationResponse | null) => {
      if (response?.notification.request.content.data?.type === 'trade_alert') {
        navigationRef.navigate('Main', { screen: 'Alerts' });
        Notifications.clearLastNotificationResponseAsync();
      }
    };
    Notifications.getLastNotificationResponseAsync().then(open);
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [navReady, session, navigationRef]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.accentBlue} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef} onReady={() => setNavReady(true)}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
