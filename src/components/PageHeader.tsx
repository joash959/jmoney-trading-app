import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  /** One-line live status under the title, e.g. "4 today · 2 buy / 1 sell". */
  context?: string | null;
  /** Prefix the context line with a pulsing green "Live" dot. */
  live?: boolean;
  /** Shows a back arrow on the left (for pushed screens). */
  onBack?: () => void;
  /** Action on the right, usually the notification bell. */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const SIDE_WIDTH = 48;

/**
 * Navigation-bar style page header: back arrow on the left, centred title
 * with an optional live context line, action on the right. Both sides are
 * the same width so the title stays truly centred. The JMONEY logo bar is
 * kept for Home and the signed-out screens.
 */
export default function PageHeader({ title, context, live, onBack, right, style }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!live) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [live, pulse]);

  return (
    <View style={[styles.row, style]}>
      <View style={styles.side}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityLabel="Back"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons name="arrow-back" size={26} color={colors.text} />
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {(!!context || live) && (
          <View style={styles.contextRow}>
            {live && (
              <>
                <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
                <Text style={styles.liveText}>Live</Text>
                {!!context && <Text style={styles.separator}>·</Text>}
              </>
            )}
            {!!context && (
              <Text numeric style={styles.context} numberOfLines={1}>
                {context}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingTop: 6,
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.6,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGreen,
  },
  liveText: {
    color: colors.accentGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    color: colors.textFaint,
    fontSize: 12,
  },
  context: {
    flexShrink: 1,
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '500',
  },
});
