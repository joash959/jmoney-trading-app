import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import IconBadge from './IconBadge';
import { colors } from '../theme/colors';
import GlassCard from './GlassCard';
import PrimaryButton from './PrimaryButton';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyStateCard({
  icon,
  title,
  subtitle,
  buttonLabel,
  onPress,
  style,
}: Props) {
  return (
    <GlassCard style={style} contentStyle={styles.card}>
      <IconBadge icon={icon} size={56} color={colors.link} backgroundColor={colors.accentBlueDim} />
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
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
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
