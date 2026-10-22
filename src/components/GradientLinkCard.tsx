import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import IconBadge, { IoniconName } from './IconBadge';

type Props = {
  title: string;
  subtitle: string;
  icon: IoniconName;
  onPress: () => void;
  /** Wash behind the card - defaults to the neutral hero tint. */
  gradient?: readonly [string, string, ...string[]];
  /** Right-hand glyph - defaults to a link arrow. */
  glyph?: IoniconName;
  style?: StyleProp<ViewStyle>;
};

/** Tappable featured row: line-icon tile, title + subtitle, arrow - on a
 * flat card (the "Monthly Statement" row in the references). */
export default function GradientLinkCard({
  title,
  subtitle,
  icon,
  onPress,
  gradient = gradients.heroCard,
  glyph = 'arrow-forward',
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      <View style={styles.card}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <IconBadge icon={icon} size={46} />
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name={glyph} size={20} color={colors.text} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.xl,
    padding: spacing.md,
    paddingRight: spacing.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  subtitle: {
    // Soft white rather than grey so it stays readable on a brand-blue wash.
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 2,
  },
});
