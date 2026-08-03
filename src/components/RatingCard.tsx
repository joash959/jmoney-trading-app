import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  name: string;
  rating: string;
};

export default function RatingCard({ name, rating }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.ratingRow}>
        <Feather name="star" size={13} color={colors.warning} />
        <Text style={styles.rating}>{rating}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    ...shadows.sm,
  },
  name: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  rating: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
});
