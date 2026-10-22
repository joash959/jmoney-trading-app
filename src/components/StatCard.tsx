import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import GlassSheen from './GlassSheen';
import IconBadge, { IoniconName } from './IconBadge';

type Props = {
  icon: IoniconName;
  trendLabel?: string;
  value: string;
  label: string;
  sublabel: string;
  style?: StyleProp<ViewStyle>;
};

export default function StatCard({
  icon,
  trendLabel,
  value,
  label,
  sublabel,
  style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      <GlassSheen />
      <View style={styles.topRow}>
        <IconBadge icon={icon} size={36} />
        {trendLabel && (
          <View style={styles.trendPill}>
            <Text style={styles.trendText} numberOfLines={1}>
              {trendLabel}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text style={styles.sublabel} numberOfLines={1}>
        {sublabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    padding: spacing.md,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  trendPill: {
    flexShrink: 1,
    backgroundColor: 'rgba(46,230,166,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendText: {
    flexShrink: 1,
    color: colors.accentGreen,
    fontSize: 10,
    fontWeight: '600',
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  sublabel: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
});
