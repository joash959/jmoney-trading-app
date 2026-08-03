import { DarkTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AISuperScannerScreen from '../screens/AISuperScannerScreen';
import TelegramChannelsScreen from '../screens/TelegramChannelsScreen';
import TradingJournalScreen from '../screens/TradingJournalScreen';
import MainTabNavigator from './MainTabNavigator';
import { colors } from '../theme/colors';
import { RootStackParamList } from './types';

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
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="AIScanner" component={AISuperScannerScreen} />
        <Stack.Screen
          name="TelegramChannels"
          component={TelegramChannelsScreen}
        />
        <Stack.Screen name="TradingJournal" component={TradingJournalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
