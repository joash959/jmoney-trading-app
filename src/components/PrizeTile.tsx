import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  rank: 1 | 2 | 3;
  accentColor: string;
  label: string;
  amount: string;
};

export default function PrizeTile({ icon, rank, accentColor, label, amount }: Props) {
  return (
    <View style={[styles.tile, { borderLeftColor: accentColor }]}>
      <View style={[styles.rankBadge, { backgroundColor: accentColor }]}>
        <Text style={styles.rankBadgeText}>{rank}</Text>
      </View>
      <View style={[styles.iconCircle, { backgroundColor: `${accentColor}1F` }]}>
        <Feather name={icon} size={20} color={accentColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color: accentColor }]} numberOfLines={1}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderLeftWidth: 3,
    paddingVertical: 16,
    paddingHorizontal: 6,
    ...shadows.sm,
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#0A0D16',
    fontSize: 10,
    fontWeight: '800',
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
  amount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
});
