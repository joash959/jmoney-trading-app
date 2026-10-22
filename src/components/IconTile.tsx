import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Text from './AppText';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import LiquidGlass from './LiquidGlass';
import Icon3D from './Icon3D';
import { ICON_3D } from '../lib/icon3dMap';
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
      <LiquidGlass style={styles.glass} interactive>
        {ICON_3D[icon] ? (
          <Icon3D name={ICON_3D[icon]} size={34} />
        ) : (
          <Ionicons name={icon} size={22} color={colors.text} />
        )}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </LiquidGlass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '23%',
    aspectRatio: 0.92,
  },
  glass: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
