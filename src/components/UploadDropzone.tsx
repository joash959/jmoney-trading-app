import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import Icon3D from './Icon3D';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

type Props = {
  title: string;
  subtitle: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function UploadDropzone({ title, subtitle, onPress, style }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.zone, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      <Icon3D name="scanner" size={64} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.cta}>
        <Ionicons name="cloud-upload-outline" size={16} color={colors.text} />
        <Text style={styles.ctaText}>Choose screenshot</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zone: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  pressed: {
    opacity: 0.75,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  ctaText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
});
