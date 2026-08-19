import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import Badge from '../components/Badge';
import GradientText from '../components/GradientText';
import GlassCard from '../components/GlassCard';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleReset = async () => {
    if (!code.trim()) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setNotice(null);
    setSubmitting(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'recovery',
    });
    if (verifyError) {
      setSubmitting(false);
      setError(verifyError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
    }
    // On success, RootNavigator swaps to the Main stack automatically
    // once the recovery session updates - no manual navigation needed here.
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(
      email
    );
    setResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setNotice('A new code has been sent to your email.');
  };

  return (
    <ScreenShell>
      <TopBar pillLabel="Back" onPillPress={() => navigation.goBack()} />

      <View style={styles.badgeRow}>
        <Badge icon="key-outline" label="Reset password" />
      </View>

      <View style={styles.heading}>
        <Text style={styles.headingLine}>Enter your</Text>
        <GradientText style={[styles.headingLine, styles.headingAccent]}>
          new password
        </GradientText>
      </View>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to {email}. Enter it below with your new
        password.
      </Text>

      <GlassCard style={styles.card}>
        <FormInput
          label="RESET CODE"
          icon="keypad-outline"
          value={code}
          onChangeText={setCode}
          placeholder="6-digit code"
          keyboardType="number-pad"
        />

        <FormInput
          label="NEW PASSWORD"
          icon="lock-closed-outline"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          secureTextEntry={!showPassword}
          containerStyle={styles.fieldSpaced}
          rightElement={
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textFaint}
              />
            </Pressable>
          }
        />

        <FormInput
          label="CONFIRM PASSWORD"
          icon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry={!showPassword}
          containerStyle={styles.fieldSpaced}
        />

        {notice && <Text style={styles.noticeText}>{notice}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <PrimaryButton
          label={submitting ? 'Resetting...' : 'Reset password'}
          onPress={handleReset}
          disabled={submitting}
          style={styles.submitButton}
        />
      </GlassCard>

      <Text style={styles.backRow}>
        Didn't get a code?{' '}
        <Text style={styles.link} onPress={handleResend}>
          {resending ? 'Resending...' : 'Resend code'}
        </Text>
      </Text>
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
  noticeText: {
    color: colors.accentGreen,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 22,
  },
  link: {
    color: colors.link,
    fontWeight: '600',
    fontSize: 14,
  },
  backRow: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 22,
  },
});
