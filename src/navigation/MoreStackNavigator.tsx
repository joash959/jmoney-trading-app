import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '../screens/MoreScreen';
import AISuperScannerScreen from '../screens/AISuperScannerScreen';
import TelegramChannelsScreen from '../screens/TelegramChannelsScreen';
import TradingJournalScreen from '../screens/TradingJournalScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import RecommendedBrokerScreen from '../screens/RecommendedBrokerScreen';
import MarketAnalysisScreen from '../screens/MarketAnalysisScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import { MoreStackParamList } from './types';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreHome" component={MoreScreen} />
      <Stack.Screen name="AIScanner" component={AISuperScannerScreen} />
      <Stack.Screen
        name="TelegramChannels"
        component={TelegramChannelsScreen}
      />
      <Stack.Screen name="TradingJournal" component={TradingJournalScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen
        name="RecommendedBroker"
        component={RecommendedBrokerScreen}
      />
      <Stack.Screen name="MarketAnalysis" component={MarketAnalysisScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
    </Stack.Navigator>
  );
}
