import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import GlassCard from './GlassCard';
import AccentCard from './AccentCard';

type Props = {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  align?: 'left' | 'center';
  featured?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function FeatureCard({
  icon,
  title,
  description,
  align = 'left',
  featured,
  style,
}: Props) {
  const Card = featured ? AccentCard : GlassCard;

  return (
    <Card style={[styles.card, align === 'center' && styles.centered, style]}>
      {icon && (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={18} color={colors.link} />
        </View>
      )}
      <Text
        style={[styles.title, align === 'center' && styles.textCenter]}
      >
        {title}
      </Text>
      <Text
        style={[styles.description, align === 'center' && styles.textCenter]}
      >
        {description}
      </Text>
    </Card>
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
    marginTop: 12,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  textCenter: {
    textAlign: 'center',
  },
});
