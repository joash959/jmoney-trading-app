import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { colors, gradients } from '../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = () => {
    // TODO: wire up Supabase auth here
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <View style={styles.logoRow}>
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoMark}
              >
                <Feather name="trending-up" size={18} color={colors.text} />
              </LinearGradient>
              <Text style={styles.logoText}>JMONEY</Text>
            </View>
            <Pressable style={styles.signUpPill}>
              <Text style={styles.signUpPillText}>Sign up</Text>
            </Pressable>
          </View>

          <View style={styles.badge}>
            <Feather name="shield" size={13} color={colors.link} />
            <Text style={styles.badgeText}>Secure sign in</Text>
          </View>

          <View style={styles.heading}>
            <Text style={styles.headingLine}>Welcome</Text>
            <MaskedView
              maskElement={
                <Text style={[styles.headingLine, styles.headingAccent]}>
                  back
                </Text>
              }
            >
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={[
                    styles.headingLine,
                    styles.headingAccent,
                    styles.headingAccentHidden,
                  ]}
                >
                  back
                </Text>
              </LinearGradient>
            </MaskedView>
          </View>
          <Text style={styles.subtitle}>Sign in to access your dashboard.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={colors.textFaint} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.textFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <Text style={[styles.label, styles.labelSpaced]}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={colors.textFaint} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.textFaint}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
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
            </View>

            <View style={styles.optionsRow}>
              <Pressable
                style={styles.rememberMe}
                onPress={() => setRememberMe((prev) => !prev)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
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

            <Pressable onPress={handleSignIn}>
              <LinearGradient
                colors={gradients.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInButton}
              >
                <Text style={styles.signInButtonText}>Sign in</Text>
                <Feather name="arrow-right" size={18} color={colors.text} />
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={styles.signUpRow}>
            Don't have an account?{' '}
            <Text style={styles.link}>Sign up free</Text>
          </Text>

          <Pressable style={styles.helpCard}>
            <View style={styles.helpIcon}>
              <Feather
                name="message-circle"
                size={16}
                color={colors.accentGreen}
              />
            </View>
            <Text style={styles.helpText}>
              Need help? <Text style={styles.helpLink}>WhatsApp us</Text>
            </Text>
            <Feather name="arrow-right" size={16} color={colors.accentGreen} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signUpPill: {
    backgroundColor: colors.accentBlue,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  signUpPillText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(78,140,255,0.35)',
    backgroundColor: 'rgba(78,140,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 24,
  },
  badgeText: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '600',
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
  headingAccentHidden: {
    opacity: 0,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    padding: 20,
    marginTop: 28,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  labelSpaced: {
    marginTop: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 18,
    marginTop: 22,
  },
  signInButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  signUpRow: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 22,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 16,
    marginTop: 20,
  },
  helpIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(37,211,102,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  helpLink: {
    color: colors.accentGreen,
    fontWeight: '700',
  },
});
