import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IoniconName;
  size?: number;
  /** Glyph colour - defaults to white, the reference look. */
  color?: string;
  /** Tint behind the glyph - defaults to neutral glass. */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

/** Thin line icon in a glass squircle - the app's single icon treatment. */
export default function IconBadge({
  icon,
  size = 44,
  color = colors.text,
  backgroundColor = colors.glassTile,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.46)} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
