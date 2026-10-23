import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  /** Small count or note beside the title, e.g. "8/8". */
  meta?: string;
  /** Link on the right, e.g. "See all". */
  actionLabel?: string;
  onAction?: () => void;
  /** Use for the first section on a screen (no top gap). */
  first?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The one section heading used across the app, so every screen groups its
 * content the same way: same size, same gap above (28) and below (12).
 */
export default function SectionHeader({
  title,
  meta,
  actionLabel,
  onAction,
  first = false,
  style,
}: Props) {
  return (
    <View style={[styles.row, first && styles.first, style]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {!!meta && (
          <Text numeric style={styles.meta}>
            {meta}
          </Text>
        )}
      </View>
      {!!actionLabel && (
        <Pressable hitSlop={10} onPress={onAction}>
          {({ pressed }) => (
            <Text style={[styles.action, pressed && styles.pressed]}>{actionLabel}</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  first: {
    marginTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  meta: {
    color: colors.textFaint,
    fontSize: 14,
    fontWeight: '500',
  },
  action: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
