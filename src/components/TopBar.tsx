import { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
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
          <Pressable
            style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
            onPress={onPillPress}
          >
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
    paddingVertical: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 30,
    height: 30,
  },
  logoText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pill: {
    backgroundColor: colors.accentBlueDim,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillPressed: {
    backgroundColor: 'rgba(122,77,255,0.28)',
  },
  pillText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
