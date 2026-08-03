import { Feather } from '@expo/vector-icons';
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

const ICONS: Record<
  keyof MainTabParamList,
  React.ComponentProps<typeof Feather>['name']
> = {
  Home: 'grid',
  Courses: 'book-open',
  Alerts: 'zap',
  Live: 'video',
  More: 'more-horizontal',
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
            <Feather
              name={ICONS[route.name as keyof MainTabParamList]}
              size={size - 4}
              color={focused ? colors.text : color}
            />
          </View>
        ),
        tabBarBadge: route.name === 'Alerts' ? 11 : undefined,
        tabBarBadgeStyle: styles.badge,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Courses" component={CoursesStackNavigator} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="More" component={MoreStackNavigator} />
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
  badge: {
    backgroundColor: colors.accentRed,
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
