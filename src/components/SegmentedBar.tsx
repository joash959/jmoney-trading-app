import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  segments: number;
  filled: number;
  filledColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function SegmentedBar({
  segments,
  filled,
  filledColor = colors.accentBlue,
  style,
}: Props) {
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < filled && { backgroundColor: filledColor },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceTrack,
  },
});
