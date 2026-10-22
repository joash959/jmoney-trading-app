import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import IconBadge, { IoniconName } from './IconBadge';

type Props = {
  icon?: IoniconName;
  iconColor?: string;
  iconBackground?: string;
  /** Replaces the icon badge, e.g. an avatar or instrument chip. */
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  subvalue?: string;
  subvalueColor?: string;
  onPress?: () => void;
  /** Hairline under the row - off for the last row in a group. */
  divider?: boolean;
  /** Trailing chevron for navigation rows. */
  chevron?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Watchlist-style row: icon, title + subtitle on the left, value + change
 * on the right. Used for alerts, sessions, events and journal entries. */
export default function ListRow({
  icon,
  iconColor,
  iconBackground,
  leading,
  title,
  subtitle,
  value,
  valueColor = colors.text,
  subvalue,
  subvalueColor = colors.textFaint,
  onPress,
  divider = true,
  chevron = false,
  style,
}: Props) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && styles.divider,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leading ??
        (icon && (
          <IconBadge
            icon={icon}
            size={42}
            color={iconColor}
            backgroundColor={iconBackground}
          />
        ))}
      <View style={styles.main}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {(!!value || !!subvalue) && (
        <View style={styles.right}>
          {!!value && (
            <Text numeric style={[styles.value, { color: valueColor }]} numberOfLines={1}>
              {value}
            </Text>
          )}
          {!!subvalue && (
            <Text numeric style={[styles.subvalue, { color: subvalueColor }]} numberOfLines={1}>
              {subvalue}
            </Text>
          )}
        </View>
      )}
      {chevron && <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.divider,
  },
  pressed: {
    opacity: 0.7,
  },
  main: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  subtitle: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    maxWidth: '45%',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  subvalue: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
