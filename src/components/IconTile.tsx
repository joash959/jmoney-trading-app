import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Text from './AppText';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import GlassSheen from './GlassSheen';
import type { IoniconName } from './IconBadge';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: IoniconName;
  label: string;
  onPress?: () => void;
  /** Overrides the default width, letting callers control per-row column count. */
  style?: StyleProp<ViewStyle>;
};

/** Square glass action tile - line icon over a short label (the "Buy / Sell
 * / Trade / Menu" row in the reference designs). */
export default function IconTile({ icon, label, onPress, style }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, style, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <GlassSheen />
      <Ionicons name={icon} size={22} color={colors.text} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '23%',
    aspectRatio: 0.92,
    borderRadius: radius.lg,
    backgroundColor: colors.glassTile,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
