import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import Icon3D, { Icon3DName } from './Icon3D';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  /** Small 3D mark beside the title. */
  icon?: Icon3DName;
  /** One-line live status under the title, e.g. "4 today · 2 buy / 1 sell". */
  context?: string | null;
  /** Prefix the context line with a pulsing green "Live" dot. */
  live?: boolean;
  /** Shows a back chevron before the title (for pushed screens). */
  onBack?: () => void;
  /** Action on the right, usually the notification bell. */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Compact page header for inner screens: 3D mark, tight title and a live
 * context line - the page says something about its data instead of just
 * naming itself. The JMONEY logo bar is kept for Home only.
 */
export default function PageHeader({ title, icon, context, live, onBack, right, style }: Props) {
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
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
        )}
        {icon && <Icon3D name={icon} size={30} />}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {right}
      </View>
      {(!!context || live) && (
        <View style={[styles.contextRow, onBack && styles.contextIndented]}>
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
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  // Line the context up under the title, past the back button.
  contextIndented: {
    marginLeft: 46,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accentGreen,
  },
  liveText: {
    color: colors.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    color: colors.textFaint,
    fontSize: 13,
  },
  context: {
    flexShrink: 1,
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '500',
  },
});
