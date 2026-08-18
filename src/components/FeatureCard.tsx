import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import GlassCard from './GlassCard';

type Props = {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
};

export default function FeatureCard({
  icon,
  title,
  description,
  align = 'left',
  style,
}: Props) {
  return (
    <GlassCard style={[styles.card, align === 'center' && styles.centered, style]}>
      {icon && (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={18} color={colors.link} />
        </View>
      )}
      <Text
        style={[styles.title, align === 'center' && styles.textCenter]}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text
        style={[styles.description, align === 'center' && styles.textCenter]}
        numberOfLines={2}
      >
        {description}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(47,111,239,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 12,
    minHeight: 38,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    minHeight: 36,
  },
  textCenter: {
    textAlign: 'center',
  },
});
