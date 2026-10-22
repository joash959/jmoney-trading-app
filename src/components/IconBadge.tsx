import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Icon3D from './Icon3D';
import { ICON_3D } from '../lib/icon3dMap';

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IoniconName;
  size?: number;
  /** Line-icon colour (only used when there's no 3D version). */
  color?: string;
  /** Tint behind the glyph - defaults to neutral glass. */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  /** Force the flat line icon even when a 3D version exists. */
  flat?: boolean;
};

/** Feature icon in a squircle: the 3D version when one exists (the
 * gamified look), otherwise a line icon. */
export default function IconBadge({
  icon,
  size = 44,
  color = colors.primary,
  backgroundColor,
  style,
  flat = false,
}: Props) {
  const icon3d = flat ? undefined : ICON_3D[icon];
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor: backgroundColor ?? (icon3d ? colors.glassTile : colors.primaryDim),
        },
        style,
      ]}
    >
      {icon3d ? (
        <Icon3D name={icon3d} size={Math.round(size * 0.64)} />
      ) : (
        <Ionicons name={icon} size={Math.round(size * 0.46)} color={color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
