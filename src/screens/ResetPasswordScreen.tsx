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
  const [resetComplete, setResetComplete] = useState(false);

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

    const { data, error: invokeError } = await supabase.functions.invoke(
      'password-reset-otp',
      {
        body: {
          action: 'reset_password',
          email,
          code: code.trim(),
          new_password: newPassword,
        },
      }
    );
    setSubmitting(false);
    if (invokeError) {
      setError(invokeError.message);
      return;
    }
    if (data?.error) {
      setError(data.error);
      return;
    }

    setResetComplete(true);
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }, 2000);
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);
    const { data, error: invokeError } = await supabase.functions.invoke(
      'password-reset-otp',
      { body: { action: 'send_code', email } }
    );
    setResending(false);
    if (invokeError) {
      setError(invokeError.message);
      return;
    }
    if (data?.error) {
      setError(data.error);
      return;
    }
    setNotice('A new code has been sent to your email.');
  };

  if (resetComplete) {
    return (
      <ScreenShell>
        <TopBar />

        <View style={styles.badgeRow}>
          <Badge icon="checkmark-circle-outline" label="Password updated" />
        </View>

        <View style={styles.heading}>
          <Text style={styles.headingLine}>You're all</Text>
          <GradientText style={[styles.headingLine, styles.headingAccent]}>
            set
          </GradientText>
        </View>
        <Text style={styles.subtitle}>
          Your password has been updated. Taking you back to sign in...
        </Text>

        <PrimaryButton
          label="Back to sign in now"
          icon={null}
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
          }
          style={styles.card}
        />
      </ScreenShell>
    );
  }

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
