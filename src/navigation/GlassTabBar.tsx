import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../components/AppText';
import { colors, gradients } from '../theme/colors';
import type { IoniconName } from '../components/IconBadge';
import LiquidGlass from '../components/LiquidGlass';

export type TabIcons = Record<string, { outline: IoniconName; filled: IoniconName }>;

type Props = BottomTabBarProps & {
  icons: TabIcons;
  /** Route rendered as the raised round button in the middle. */
  centerRoute: string;
};

/** Floating frosted-glass tab bar with a raised centre button, after the
 * reference designs. Emits the standard tabPress events, so per-tab
 * listeners (e.g. "reset this stack to its root") keep working. */
export default function GlassTabBar({
  state,
  descriptors,
  navigation,
  icons,
  centerRoute,
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboardOpen = useKeyboardOpen();

  // On Android the keyboard resizes the window, which would push an
  // absolutely positioned bar up above it - hide it instead.
  if (keyboardOpen && Platform.OS === 'android') return null;

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom - 6, 12) }]}>
      <LiquidGlass style={styles.capsule} blurOnAndroid intensity={40} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const badge = options.tabBarBadge;
          const icon = icons[route.name];

          const onPress = () => {
            Haptics.selectionAsync();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          const onLongPress = () =>
            navigation.emit({ type: 'tabLongPress', target: route.key });

          if (route.name === centerRoute) {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.item}
              >
                <View style={styles.centerLift}>
                  <LinearGradient
                    colors={gradients.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.centerRing}
                  >
                    <View style={[styles.centerInner, focused && styles.centerInnerActive]}>
                      <Ionicons
                        name={focused ? icon.filled : icon.outline}
                        size={26}
                        color={colors.text}
                      />
                    </View>
                  </LinearGradient>
                  {badge != null && <TabBadge value={badge} style={styles.centerBadge} />}
                </View>
                <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
            >
              <View>
                <Ionicons
                  name={focused ? icon.filled : icon.outline}
                  size={23}
                  color={focused ? colors.primary : colors.textMuted}
                />
                {badge != null && <TabBadge value={badge} style={styles.iconBadge} />}
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TabBadge({ value, style }: { value: string | number; style: object }) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {typeof value === 'number' && value > 9 ? '9+' : value}
      </Text>
    </View>
  );
}

function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

const styles = StyleSheet.create({
  // Floating capsule, inset from the screen edges (iOS 26 style).
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 66,
  },
  capsule: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 33,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
  },
  centerLift: {
    marginTop: -34,
    borderRadius: 31,
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  centerRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 1.5,
  },
  centerInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#121218',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInnerActive: {
    backgroundColor: '#13214A',
  },
  centerBadge: {
    top: 0,
    right: 0,
  },
  iconBadge: {
    top: -4,
    right: -10,
  },
  badge: {
    position: 'absolute',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
});
