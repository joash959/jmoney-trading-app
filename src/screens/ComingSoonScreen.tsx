import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
};

export default function ComingSoonScreen({ icon, title }: Props) {
  return (
    <ScreenShell>
      <TopBar />
      <View style={styles.wrap}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={28} color={colors.link} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 100,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
});
