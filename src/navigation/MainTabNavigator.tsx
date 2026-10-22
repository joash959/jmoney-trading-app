import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CoursesStackNavigator from './CoursesStackNavigator';
import AlertsScreen from '../screens/AlertsScreen';
import LiveScreen from '../screens/LiveScreen';
import MoreStackNavigator from './MoreStackNavigator';
import GlassTabBar, { TabIcons } from './GlassTabBar';
import { useAlertsBadge } from '../contexts/AlertsBadgeContext';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Ionicons ships matched outline/filled pairs (the same pattern iOS's own
// tab bar icons use) - outline while inactive, filled when the tab is
// selected, instead of a single fixed glyph for both states.
const ICONS: TabIcons & Record<keyof MainTabParamList, TabIcons[string]> = {
  Home: { outline: 'home-outline', filled: 'home' },
  Courses: { outline: 'school-outline', filled: 'school' },
  Alerts: { outline: 'flash-outline', filled: 'flash' },
  Live: { outline: 'videocam-outline', filled: 'videocam' },
  More: { outline: 'grid-outline', filled: 'grid' },
};

export default function MainTabNavigator() {
  const { unseenCount } = useAlertsBadge();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <GlassTabBar {...props} icons={ICONS} centerRoute="Alerts" />
      )}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Courses', { screen: 'CoursesHome' });
          },
        })}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarBadge: unseenCount > 0 ? unseenCount : undefined,
        }}
      />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen
        name="More"
        component={MoreStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('More', { screen: 'MoreHome' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
