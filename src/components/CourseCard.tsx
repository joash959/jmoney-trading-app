import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  level: string;
  instructor: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function CourseCard({
  level,
  instructor,
  category,
  title,
  description,
  duration,
  lessons,
  onPress,
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardShadow,
        style,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.card}>
        <LinearGradient colors={['#1B2033', '#0A0D16']} style={styles.thumb}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
          <View style={styles.thumbIconWrap} pointerEvents="none">
            <Image
              source={require('../../assets/courses.png')}
              style={styles.thumbIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.avatarWrap}>
            <LinearGradient colors={gradients.brand} style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(instructor)}</Text>
            </LinearGradient>
            <View style={styles.playBadge}>
              <Ionicons name="play-outline" size={11} color={colors.text} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={11} color={colors.textFaint} />
              <Text style={styles.metaText}>{duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={11} color={colors.textFaint} />
              <Text style={styles.metaText}>{lessons} lessons</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.instructor} numberOfLines={1}>
            {instructor}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: 14,
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  thumb: {
    aspectRatio: 1.3,
    padding: 10,
  },
  levelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37,211,102,0.15)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: {
    color: colors.accentGreen,
    fontSize: 10,
    fontWeight: '700',
  },
  thumbIconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: {
    width: '42%',
    height: '42%',
    opacity: 0.9,
  },
  avatarWrap: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  playBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  body: {
    padding: 12,
  },
  category: {
    color: colors.link,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
    lineHeight: 18,
  },
  description: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 5,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textFaint,
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginTop: 10,
    marginBottom: 8,
  },
  instructor: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
