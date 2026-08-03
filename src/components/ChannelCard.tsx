import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import GlassCard from './GlassCard';
import AccentCard from './AccentCard';
import Pill from './Pill';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor?: string;
  title: string;
  titleColor?: string;
  tagLabel: string;
  tagColor: string;
  tagBackground?: string;
  description: string;
  members: string;
  featured?: boolean;
  onJoinPress?: () => void;
};

export default function ChannelCard({
  icon,
  iconColor = colors.link,
  title,
  titleColor = colors.text,
  tagLabel,
  tagColor,
  tagBackground,
  description,
  members,
  featured,
  onJoinPress,
}: Props) {
  const Card = featured ? AccentCard : GlassCard;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <Pill label={tagLabel} color={tagColor} backgroundColor={tagBackground} />
      </View>

      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.footerRow}>
        <View style={styles.membersRow}>
          <Feather name="users" size={14} color={colors.textFaint} />
          <Text style={styles.membersText}>{members} members</Text>
        </View>
        <Pressable style={styles.joinRow} onPress={onJoinPress}>
          <Text style={styles.joinText}>Join</Text>
          <Feather name="external-link" size={14} color={colors.link} />
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(47,111,239,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membersText: {
    color: colors.textFaint,
    fontSize: 13,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinText: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '700',
  },
});
