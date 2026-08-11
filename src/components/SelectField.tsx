import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

type Props = {
  label?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value?: string | null;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function SelectField({
  label,
  icon,
  placeholder,
  value,
  onPress,
  containerStyle,
}: Props) {
  const isActive = !!value;

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={({ pressed }) => [
          styles.wrapper,
          isActive && styles.wrapperActive,
          pressed && styles.wrapperPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.left}>
          {icon && (
            <Ionicons
              name={icon}
              size={14}
              color={isActive ? colors.accentBlue : colors.textFaint}
            />
          )}
          <Text
            style={isActive ? styles.value : styles.placeholder}
            numberOfLines={1}
          >
            {value ?? placeholder}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isActive ? colors.accentBlue : colors.textFaint}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 38,
  },
  wrapperActive: {
    backgroundColor: colors.accentBlueDim,
  },
  wrapperPressed: {
    opacity: 0.8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  placeholder: {
    flex: 1,
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    flex: 1,
    color: colors.accentBlue,
    fontSize: 13,
    fontWeight: '700',
  },
});
