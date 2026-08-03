import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  level: string;
  eyebrow: string;
  instructor: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  onPress?: () => void;
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
  eyebrow,
  instructor,
  category,
  title,
  description,
  duration,
  lessons,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.cardShadow, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.card}>
        <LinearGradient colors={['#1B2033', '#0A0D16']} style={styles.thumb}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
          <Text style={styles.eyebrow} numberOfLines={2}>
            {eyebrow}
          </Text>
          <View style={styles.avatarWrap}>
            <LinearGradient colors={gradients.brand} style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(instructor)}</Text>
            </LinearGradient>
            <View style={styles.playBadge}>
              <Feather name="play" size={12} color={colors.text} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={13} color={colors.textFaint} />
              <Text style={styles.metaText}>{duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="book" size={13} color={colors.textFaint} />
              <Text style={styles.metaText}>{lessons} lessons</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.instructor}>{instructor}</Text>
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
    aspectRatio: 1.7,
    padding: 14,
  },
  levelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37,211,102,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: colors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  eyebrow: {
    color: colors.warning,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 10,
  },
  avatarWrap: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  playBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  body: {
    padding: 16,
  },
  category: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: colors.textFaint,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginTop: 14,
    marginBottom: 12,
  },
  instructor: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
