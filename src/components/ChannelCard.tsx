import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import GlassCard from './GlassCard';
import Pill from './Pill';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  iconBackground?: string;
  title: string;
  titleColor?: string;
  tagLabel: string;
  tagColor: string;
  tagBackground?: string;
  description: string;
  members: string;
  /** Premium-tier channel the user hasn't unlocked yet. */
  locked?: boolean;
  /** Fetching the invite link from the server. */
  loading?: boolean;
  onJoinPress?: () => void;
};

export default function ChannelCard({
  icon,
  iconColor = colors.link,
  iconBackground = 'rgba(47,111,239,0.15)',
  title,
  titleColor = colors.text,
  tagLabel,
  tagColor,
  tagBackground,
  description,
  members,
  locked,
  loading,
  onJoinPress,
}: Props) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        {locked ? (
          <Pill label="Premium" color={colors.warning} backgroundColor={colors.warningDim} />
        ) : (
          <Pill label={tagLabel} color={tagColor} backgroundColor={tagBackground} />
        )}
      </View>

      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.membersRow}>
          <Ionicons name="people-outline" size={13} color={colors.textFaint} />
          <Text style={styles.membersText}>{members} members</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.joinButton,
            locked && styles.joinButtonLocked,
            pressed && styles.joinButtonPressed,
          ]}
          onPress={onJoinPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={locked ? colors.warning : colors.text}
            />
          ) : (
            <>
              <Text style={[styles.joinButtonText, locked && styles.joinButtonTextLocked]}>
                {locked ? 'Unlock' : 'Join'}
              </Text>
              <Ionicons
                name={locked ? 'lock-closed-outline' : 'arrow-forward-outline'}
                size={13}
                color={locked ? colors.warning : colors.text}
              />
            </>
          )}
        </Pressable>
      </View>
    </GlassCard>
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
    width: 48,
    height: 48,
    borderRadius: radius.lg,
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
    marginTop: 18,
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
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentBlue,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  joinButtonLocked: {
    backgroundColor: colors.warningDim,
  },
  joinButtonPressed: {
    opacity: 0.85,
  },
  joinButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  joinButtonTextLocked: {
    color: colors.warning,
  },
});
