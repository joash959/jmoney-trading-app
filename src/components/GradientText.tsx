import type { ComponentType } from 'react';
import { TextStyle } from 'react-native';
import Text from './AppText';
import { LinearGradient } from 'expo-linear-gradient';
import RNMaskedView, { MaskedViewProps } from '@react-native-masked-view/masked-view';
import { gradients } from '../theme/colors';

// masked-view's class typings predate React 19.3's JSX types; the
// component itself works unchanged.
const MaskedView = RNMaskedView as unknown as ComponentType<MaskedViewProps>;

type Props = {
  children: string;
  style: TextStyle | TextStyle[];
  colors?: readonly [string, string, ...string[]];
};

export default function GradientText({
  children,
  style,
  colors: gradientColors = gradients.brand,
}: Props) {
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
