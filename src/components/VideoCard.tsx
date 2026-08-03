import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  eyebrow: string;
  title: string;
  author: string;
  duration: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function VideoCard({
  eyebrow,
  title,
  author,
  duration,
  onPress,
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      <View style={styles.thumbShadow}>
        <LinearGradient colors={['#1B2033', '#0A0D16']} style={styles.thumb}>
          <Text style={styles.eyebrow} numberOfLines={2}>
            {eyebrow}
          </Text>
          <View style={styles.playCircle}>
            <Feather name="play" size={16} color={colors.text} />
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        </LinearGradient>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.author}>{author}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  thumbShadow: {
    borderRadius: 14,
    ...shadows.sm,
  },
  thumb: {
    aspectRatio: 1.1,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  eyebrow: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playCircle: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    lineHeight: 18,
  },
  author: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 3,
  },
});
