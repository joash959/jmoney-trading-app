import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import GlassCard from './GlassCard';
import PrimaryButton from './PrimaryButton';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconVariant?: 'circle' | 'plain';
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyStateCard({
  icon,
  iconVariant = 'circle',
  title,
  subtitle,
  buttonLabel,
  onPress,
  style,
}: Props) {
  return (
    <GlassCard style={style} contentStyle={styles.card}>
      {iconVariant === 'circle' ? (
        <View style={styles.iconCircle}>
          <Feather name={icon} size={22} color={colors.link} />
        </View>
      ) : (
        <Feather name={icon} size={48} color={colors.textFaint} />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {buttonLabel && (
        <PrimaryButton
          label={buttonLabel}
          icon={null}
          variant="flat"
          onPress={onPress}
          style={styles.button}
        />
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  button: {
    marginTop: 18,
    paddingHorizontal: 28,
    height: 48,
  },
});
