import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, TextStyle } from 'react-native';
import Text from './AppText';

type Props = {
  value: number;
  format: (value: number) => string;
  style?: StyleProp<TextStyle>;
  /** Skip the count and show the value as-is (e.g. while scrubbing a chart). */
  instant?: boolean;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
};

/** A figure that counts from its previous value to the new one, so changes
 * read as movement rather than a jump. */
export default function AnimatedNumber({
  value,
  format,
  style,
  instant = false,
  numberOfLines,
  adjustsFontSizeToFit,
}: Props) {
  const anim = useRef(new Animated.Value(value)).current;
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShown(v));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    if (instant) {
      anim.stopAnimation();
      anim.setValue(value);
      return;
    }
    Animated.timing(anim, {
      toValue: value,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, instant, anim]);

  return (
    <Text
      numeric
      style={style}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
    >
      {format(shown)}
    </Text>
  );
}
