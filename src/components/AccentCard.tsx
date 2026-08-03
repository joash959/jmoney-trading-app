import { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import GlassCard from './GlassCard';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AccentCard({ children, style }: Props) {
  return (
    <GlassCard style={style} contentStyle={styles.accent}>
      {children}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  accent: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentBlue,
  },
});
