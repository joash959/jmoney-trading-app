import { Text, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { gradients } from '../theme/colors';

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
