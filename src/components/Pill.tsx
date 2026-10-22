import { StyleSheet, View } from 'react-native';
import Text from './AppText';

type Props = {
  label: string;
  color: string;
  backgroundColor?: string;
};

export default function Pill({ label, color, backgroundColor }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: backgroundColor ?? `${color}22` }]}>
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
