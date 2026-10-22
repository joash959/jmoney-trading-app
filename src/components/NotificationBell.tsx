import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  count?: number;
  onPress?: () => void;
};

/** Round glass icon button with an unread dot/count. */
export default function NotificationBell({ count = 0, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Ionicons name="notifications-outline" size={20} color={colors.text} />
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
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassTile,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.cardBorder,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
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
