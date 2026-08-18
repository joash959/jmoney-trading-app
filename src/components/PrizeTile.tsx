import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  label: string;
  amount: string;
  amountColor: string;
  backgroundColor: string;
  /** 1st place gets a gradient card + glow instead of a flat tinted tile. */
  featured?: boolean;
  gradient?: readonly [string, string, ...string[]];
};

export default function PrizeTile({
  icon,
  iconColor,
  label,
  amount,
  amountColor,
  backgroundColor,
  featured,
  gradient,
}: Props) {
  const content = (
    <>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: featured
              ? 'rgba(255,255,255,0.22)'
              : `${iconColor}22`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={featured ? colors.text : iconColor}
        />
      </View>
      <Text style={[styles.label, featured && styles.labelFeatured]}>
        {label}
      </Text>
      <Text
        style={[styles.amount, { color: featured ? colors.text : amountColor }]}
        numberOfLines={1}
      >
        {amount}
      </Text>
    </>
  );

  if (featured && gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tile, styles.tileFeatured]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.tile, { backgroundColor }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.xl,
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  tileFeatured: {
    paddingVertical: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  labelFeatured: {
    color: 'rgba(255,255,255,0.85)',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
});
