import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
};

export default function Badge({ icon, label }: Props) {
  return (
    <View style={styles.badge}>
      <Feather name={icon} size={13} color={colors.link} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(78,140,255,0.35)',
    backgroundColor: 'rgba(78,140,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '600',
  },
});
