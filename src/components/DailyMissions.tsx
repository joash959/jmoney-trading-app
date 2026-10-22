import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import Icon3D, { Icon3DName } from './Icon3D';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import GlassSheen from './GlassSheen';

export type Mission = {
  key: string;
  icon: Icon3DName;
  title: string;
  /** XP the mission is worth; 0 shows a plain "Go". */
  xp: number;
  done: boolean;
  onPress?: () => void;
};

/** Today's checklist - small daily goals that keep the streak alive. */
export default function DailyMissions({
  missions,
  style,
}: {
  missions: Mission[];
  style?: StyleProp<ViewStyle>;
}) {
  const done = missions.filter((m) => m.done).length;
  const allDone = done === missions.length;

  return (
    <View style={[styles.card, style]}>
      <GlassSheen />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon3D name="target" size={26} />
          <Text style={styles.title}>Daily missions</Text>
        </View>
        <Text numeric style={[styles.count, allDone && styles.countDone]}>
          {allDone ? 'All done!' : `${done}/${missions.length}`}
        </Text>
      </View>

      {missions.map((mission) => (
        <Pressable
          key={mission.key}
          onPress={mission.done ? undefined : mission.onPress}
          style={({ pressed }) => [styles.row, pressed && !mission.done && styles.rowPressed]}
        >
          <View style={[styles.iconTile, mission.done && styles.iconTileDone]}>
            <Icon3D name={mission.icon} size={34} />
          </View>
          <Text style={[styles.missionTitle, mission.done && styles.missionTitleDone]} numberOfLines={1}>
            {mission.title}
          </Text>
          {mission.done ? (
            <View style={styles.check}>
              <Ionicons name="checkmark" size={16} color={colors.text} />
            </View>
          ) : (
            <View style={styles.xpPill}>
              <Text numeric style={styles.xpText}>
                {mission.xp > 0 ? `+${mission.xp} XP` : 'Go'}
              </Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    backgroundColor: colors.card,
    padding: 16,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  count: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '600',
  },
  countDone: {
    color: colors.accentGreen,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
  },
  rowPressed: {
    opacity: 0.7,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileDone: {
    opacity: 0.5,
  },
  missionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  missionTitleDone: {
    color: colors.textFaint,
    textDecorationLine: 'line-through',
  },
  xpPill: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  xpText: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '600',
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
