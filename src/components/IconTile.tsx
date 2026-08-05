import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

export type IconTileGradient = readonly [string, string, ...string[]];

export const iconTileGradients: Record<string, IconTileGradient> = {
  blue: ['#4E8CFF', '#2F6FEF'],
  purple: ['#A78BFA', '#7C3AED'],
  green: ['#4ADE80', '#16A34A'],
  teal: ['#22D3EE', '#0891B2'],
  gold: ['#FDE047', '#F5C518'],
  red: ['#F87171', '#EF4444'],
};

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  gradient?: IconTileGradient;
  /** Optional real icon artwork - overrides the Feather glyph when provided. */
  image?: number;
  onPress?: () => void;
  /** Overrides the default width, letting callers control per-row column count. */
  style?: StyleProp<ViewStyle>;
};

export default function IconTile({
  icon,
  label,
  gradient = iconTileGradients.blue,
  image,
  onPress,
  style,
}: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed]}
      onPress={handlePress}
    >
      {image ? (
        <View style={styles.imageTile}>
          <Image source={image} style={styles.image} resizeMode="contain" />
        </View>
      ) : (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <Feather name={icon} size={22} color={colors.text} />
        </LinearGradient>
      )}
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '23%',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  imageTile: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 56,
    height: 56,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
});
