import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

type Props = {
  title: string;
  subtitle: string;
  /** Ionicons glyph shown on the right, in a tinted circle. */
  icon: React.ComponentProps<typeof Ionicons>['name'];
  /** require()'d artwork (e.g. a real brand logo) - overrides the Ionicons glyph when provided. */
  image?: number;
  onPress: () => void;
  /** Defaults to the app's standard blue button gradient. */
  gradient?: readonly [string, string, ...string[]];
  /** Top-right glyph - defaults to a link arrow, pass "checkmark-circle-outline" etc. for a status card. */
  glyph?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
};

/** Tappable gradient banner - the "Connect PrimeXBT" / "Trade Alerts" card style from Home. */
export default function GradientLinkCard({
  title,
  subtitle,
  icon,
  image,
  onPress,
  gradient = gradients.button,
  glyph = 'arrow-forward-outline',
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Ionicons name={glyph} size={20} color={colors.text} style={styles.arrow} />
        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {image ? (
            <Image source={image} style={styles.icon} resizeMode="contain" />
          ) : (
            <View style={styles.iconCircle}>
              <Ionicons name={icon} size={28} color={colors.text} />
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    position: 'relative',
    ...shadows.glow,
  },
  arrow: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
    paddingRight: 24,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 6,
  },
  icon: {
    width: 72,
    height: 72,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
