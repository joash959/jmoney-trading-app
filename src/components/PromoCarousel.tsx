import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { IconTileGradient } from './IconTile';

export type PromoItem = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle: string;
  gradient: IconTileGradient;
  onPress?: () => void;
};

type Props = {
  items: PromoItem[];
};

const SCREEN_PADDING = spacing.lg * 2;

export default function PromoCarousel({ items }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = width - SCREEN_PADDING;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
      >
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={item.onPress}
            style={({ pressed }) => [
              { width: cardWidth },
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.iconCircle}>
                <Feather name={item.icon} size={20} color={colors.text} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 130,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    marginTop: spacing.sm,
    ...typography.headline,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    ...typography.footnote,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceTrack,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.accentBlue,
  },
});
