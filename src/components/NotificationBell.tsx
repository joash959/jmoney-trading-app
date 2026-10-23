import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import LiquidGlass from './LiquidGlass';

type Props = {
  count?: number;
  onPress?: () => void;
  /** Bare icon for navigation-bar headers; the glass circle is for Home. */
  plain?: boolean;
};

/** Bell icon button with an unread count - glass circle, or plain. */
export default function NotificationBell({ count = 0, onPress, plain = false }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="Notifications"
    >
      {plain ? (
        <View style={styles.plain}>
          <Ionicons name="notifications-outline" size={25} color={colors.text} />
        </View>
      ) : (
        <LiquidGlass style={styles.glass} interactive>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
        </LiquidGlass>
      )}
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 44,
    height: 44,
  },
  glass: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '600',
  },
});
