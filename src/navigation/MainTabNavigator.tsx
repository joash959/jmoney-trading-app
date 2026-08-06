import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import CoursesStackNavigator from './CoursesStackNavigator';
import AlertsScreen from '../screens/AlertsScreen';
import LiveScreen from '../screens/LiveScreen';
import MoreStackNavigator from './MoreStackNavigator';
import { colors } from '../theme/colors';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Ionicons ships matched outline/filled pairs (the same pattern iOS's own
// tab bar icons use) - outline while inactive, filled when the tab is
// selected, instead of a single fixed glyph for both states.
const ICONS: Record<
  keyof MainTabParamList,
  {
    outline: React.ComponentProps<typeof Ionicons>['name'];
    filled: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  Home: { outline: 'home-outline', filled: 'home' },
  Courses: { outline: 'book-outline', filled: 'book' },
  Alerts: { outline: 'flash-outline', filled: 'flash' },
  Live: { outline: 'videocam-outline', filled: 'videocam' },
  More: {
    outline: 'ellipsis-horizontal-circle-outline',
    filled: 'ellipsis-horizontal-circle',
  },
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accentBlue,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => (
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Ionicons
              name={
                focused
                  ? ICONS[route.name as keyof MainTabParamList].filled
                  : ICONS[route.name as keyof MainTabParamList].outline
              }
              size={size - 4}
              color={focused ? colors.text : color}
            />
          </View>
        ),
      })}
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
      <Tab.Screen name="Alerts" component={AlertsScreen} />
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.cardBorder,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.accentBlue,
  },
});
