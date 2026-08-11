import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Badge =
  | { type: 'new' }
  | { type: 'down'; amount: number }
  | { type: 'up'; amount: number };

type Props = {
  rank: number | null;
  rankIconColor: string;
  name: string;
  subtitle: string;
  lots: string;
  badge?: Badge;
};

export default function LeaderboardRow({
  rank,
  rankIconColor,
  name,
  subtitle,
  lots,
  badge,
}: Props) {
  const isTopThree = !!rank && rank <= 3;

  return (
    <View style={styles.row}>
      <View style={styles.rankColumn}>
        {isTopThree ? (
          <Ionicons name="trophy-outline" size={22} color={rankIconColor} />
        ) : (
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{rank ?? '—'}</Text>
          </View>
        )}
        {badge?.type === 'new' && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {(badge?.type === 'down' || badge?.type === 'up') && (
          <View style={styles.changeBadge}>
            <Ionicons
              name={badge.type === 'down' ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={10}
              color={badge.type === 'down' ? colors.accentRed : colors.accentGreen}
            />
            <Text
              style={[
                styles.changeText,
                {
                  color:
                    badge.type === 'down' ? colors.accentRed : colors.accentGreen,
                },
              ]}
            >
              {badge.amount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.lotsColumn}>
        <Text style={styles.lotsValue}>{lots}</Text>
        <Text style={styles.lotsLabel}>LOTS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 14,
  },
  rankColumn: {
    alignItems: 'center',
    width: 34,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  newBadge: {
    backgroundColor: colors.accentBlueDim,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  newBadgeText: {
    color: colors.link,
    fontSize: 9,
    fontWeight: '800',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  lotsColumn: {
    alignItems: 'flex-end',
  },
  lotsValue: {
    color: colors.link,
    fontSize: 16,
    fontWeight: '800',
  },
  lotsLabel: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 1,
  },
});
