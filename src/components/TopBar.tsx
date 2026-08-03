import { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  pillLabel?: string;
  onPillPress?: () => void;
  rightElement?: ReactNode;
};

export default function TopBar({ pillLabel, onPillPress, rightElement }: Props) {
  return (
    <View style={styles.topBar}>
      <View style={styles.logoRow}>
        <Image
          source={require('../../assets/jmoney-mark.png')}
          style={styles.logoMark}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>JMONEY</Text>
      </View>
      {rightElement ??
        (pillLabel && (
          <Pressable style={styles.pill} onPress={onPillPress}>
            <Text style={styles.pillText}>{pillLabel}</Text>
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
  },
  logoText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pill: {
    backgroundColor: colors.accentBlue,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  pillText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
});
