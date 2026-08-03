import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import Badge from '../components/Badge';
import GradientText from '../components/GradientText';
import GlassCard from '../components/GlassCard';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import WhatsAppHelpCard from '../components/WhatsAppHelpCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = () => {
    // TODO: wire up Supabase auth here
  };

  return (
    <ScreenShell>
      <TopBar
        pillLabel="Sign up"
        onPillPress={() => navigation.navigate('SignUp')}
      />

      <View style={styles.badgeRow}>
        <Badge icon="shield" label="Secure sign in" />
      </View>

      <View style={styles.heading}>
        <Text style={styles.headingLine}>Welcome</Text>
        <GradientText style={[styles.headingLine, styles.headingAccent]}>
          back
        </GradientText>
      </View>
      <Text style={styles.subtitle}>Sign in to access your dashboard.</Text>

      <GlassCard style={styles.card}>
        <FormInput
          label="EMAIL"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
        />

        <FormInput
          label="PASSWORD"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
          containerStyle={styles.fieldSpaced}
          rightElement={
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={colors.textFaint}
              />
            </Pressable>
          }
        />

        <View style={styles.optionsRow}>
          <Pressable
            style={styles.rememberMe}
            onPress={() => setRememberMe((prev) => !prev)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && (
                <Feather name="check" size={12} color={colors.text} />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </View>

        <PrimaryButton
          label="Sign in"
          onPress={handleSignIn}
          style={styles.signInButton}
        />
      </GlassCard>

      <Text style={styles.signUpRow}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          Sign up free
        </Text>
      </Text>

      <WhatsAppHelpCard />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    marginTop: 24,
  },
  heading: {
    alignItems: 'center',
    marginTop: 16,
  },
  headingLine: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 46,
  },
  headingAccent: {
    fontStyle: 'italic',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    marginTop: 28,
  },
  fieldSpaced: {
    marginTop: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  rememberMeText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  link: {
    color: colors.link,
    fontWeight: '600',
    fontSize: 14,
  },
  signInButton: {
    marginTop: 22,
  },
  signUpRow: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 22,
  },
});
