import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
};

export default function Badge({ icon, label }: Props) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={13} color={colors.link} />
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
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(157,151,255,0.35)',
    backgroundColor: colors.accentBlueDim,
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
