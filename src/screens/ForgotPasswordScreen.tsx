import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
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
import WhatsAppHelpCard from '../components/WhatsAppHelpCard';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Enter the email address on your account.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim()
    );
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    navigation.navigate('ResetPassword', { email: email.trim() });
  };

  return (
    <ScreenShell>
      <TopBar pillLabel="Back" onPillPress={() => navigation.goBack()} />

      <View style={styles.badgeRow}>
        <Badge icon="key-outline" label="Reset password" />
      </View>

      <View style={styles.heading}>
        <Text style={styles.headingLine}>Forgot your</Text>
        <GradientText style={[styles.headingLine, styles.headingAccent]}>
          password?
        </GradientText>
      </View>
      <Text style={styles.subtitle}>
        Enter the email on your account and we'll send you a 6-digit code to
        reset your password.
      </Text>

      <GlassCard style={styles.card}>
        <FormInput
          label="EMAIL"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <PrimaryButton
          label={submitting ? 'Sending code...' : 'Send reset code'}
          onPress={handleSendCode}
          disabled={submitting}
          style={styles.submitButton}
        />
      </GlassCard>

      <Text style={styles.backRow}>
        Remembered it?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Back to sign in
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
