import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { parseFunctionError } from '../lib/functionError';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import Icon3D, { Icon3DName } from '../components/Icon3D';
import GlassCard from '../components/GlassCard';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import WhatsAppHelpCard from '../components/WhatsAppHelpCard';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

type CreatedAccount = {
  email: string;
  password: string;
};

export default function SignUpScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreed, setAgreed] = useState(false);
  // Ticks step 1 once the member has opened the broker sign-up.
  const [brokerOpened, setBrokerOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(
    null
  );
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(
    null
  );

  const handleOpenBroker = () => {
    setBrokerOpened(true);
    Linking.openURL('https://go.primexbt.direct/visit/?bta=53738&brand=primexbt');
  };

  const handleCopy = async (field: 'email' | 'password', value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleContinue = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !country.trim() ||
      !whatsapp.trim()
    ) {
      setError('Please fill in all fields.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms & Conditions to continue.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const { data, error: fnError } = await supabase.functions.invoke(
      'submit-onboarding-lead',
      {
        body: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          country: country.trim(),
          phone: whatsapp.trim(),
        },
      }
    );

    setSubmitting(false);

    if (fnError) {
      setError(await parseFunctionError(fnError));
      return;
    }

    if (data?.password) {
      setCreatedAccount({ email: data.email, password: data.password });
    } else {
      setError(
        data?.message ??
          'An account already exists for this email. Please log in.'
      );
    }
  };

  if (createdAccount) {
    return (
      <ScreenShell>
        <TopBar
          pillLabel="Log in"
          onPillPress={() => navigation.navigate('Login')}
        />

        <View style={styles.hero}>
          <Icon3D name="check" size={84} />
          <Text style={styles.title}>You're in!</Text>
          <Text style={styles.subtitle}>
            Save these details — you'll need them to log in. We've also
            emailed them to you.
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.credentialLabel}>Email</Text>
          <Pressable
            style={styles.credentialRow}
            onPress={() => handleCopy('email', createdAccount.email)}
          >
            <Text style={styles.credentialValue} numberOfLines={1}>
              {createdAccount.email}
            </Text>
            <Ionicons
              name={copiedField === 'email' ? 'checkmark-outline' : 'copy-outline'}
              size={18}
              color={copiedField === 'email' ? colors.accentGreen : colors.textFaint}
            />
          </Pressable>

          <Text style={[styles.credentialLabel, styles.fieldSpaced]}>Password</Text>
          <Pressable
            style={styles.credentialRow}
            onPress={() => handleCopy('password', createdAccount.password)}
          >
            <Text numeric style={styles.credentialValue}>
              {createdAccount.password}
            </Text>
            <Ionicons
              name={copiedField === 'password' ? 'checkmark-outline' : 'copy-outline'}
              size={18}
              color={copiedField === 'password' ? colors.accentGreen : colors.textFaint}
            />
          </Pressable>
          <Text style={styles.copyHint}>Tap a field to copy it</Text>

          <PrimaryButton
            label="Log in now"
            onPress={() => navigation.navigate('Login')}
            style={styles.fieldSpaced}
          />
        </GlassCard>

        <WhatsAppHelpCard />
      </ScreenShell>
    );
  }

  const detailsStarted = !!(firstName || lastName || email || country || whatsapp);

  return (
    <ScreenShell>
      <TopBar pillLabel="Log in" onPillPress={() => navigation.navigate('Login')} />

      <View style={styles.hero}>
        <Icon3D name="rocket" size={76} />
        <Text style={styles.title}>Join JMONEY free</Text>
        <Text style={styles.subtitle}>
          Two quick steps and your login is on its way by email and WhatsApp.
        </Text>
      </View>

      <View style={styles.perks}>
        {PERKS.map((perk) => (
          <View key={perk.label} style={styles.perk}>
            <Icon3D name={perk.icon} size={36} />
            <Text style={styles.perkLabel}>{perk.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.stepper}>
        <StepDot number={1} label="Broker" state={brokerOpened ? 'done' : 'active'} />
        <View style={[styles.stepLine, brokerOpened && styles.stepLineDone]} />
        <StepDot
          number={2}
          label="Your details"
          state={brokerOpened || detailsStarted ? 'active' : 'upcoming'}
        />
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.stepHeader}>
          <StepNumber number={1} done={brokerOpened} />
          <View style={styles.stepHeaderText}>
            <Text style={styles.stepTitle}>Open your PrimeXBT account</Text>
            <Text style={styles.stepDescription}>
              It's free and opens in your browser.
            </Text>
          </View>
        </View>

        <PrimaryButton
          label={brokerOpened ? 'Open PrimeXBT again' : 'Open PrimeXBT account'}
          icon="open-outline"
          onPress={handleOpenBroker}
          style={styles.fieldSpaced}
        />

        <Pressable
          style={styles.haveAccountRow}
          hitSlop={8}
          onPress={() =>
            Linking.openURL(
              'https://wa.me/27686784063?text=Hi%20JMONEY%2C%20I%20already%20have%20a%20PrimeXBT%20account.'
            )
          }
        >
          <Text style={styles.haveAccountText}>Already have an account? </Text>
          <Text style={styles.haveAccountLink}>WhatsApp us</Text>
          <Ionicons name="logo-whatsapp" size={15} color={colors.accentGreen} />
        </Pressable>
      </GlassCard>

      <GlassCard style={styles.card}>
        <View style={styles.stepHeader}>
          <StepNumber number={2} />
          <View style={styles.stepHeaderText}>
            <Text style={styles.stepTitle}>Your details</Text>
            <Text style={styles.stepDescription}>
              We'll create your account and show your login straight away.
            </Text>
          </View>
        </View>

        <View style={[styles.row, styles.fieldSpaced]}>
          <FormInput
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jane"
            autoCapitalize="words"
            containerStyle={styles.rowField}
          />
          <FormInput
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            autoCapitalize="words"
            containerStyle={styles.rowField}
          />
        </View>

        <FormInput
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          containerStyle={styles.fieldSpaced}
        />

        <FormInput
          label="Country"
          icon="globe-outline"
          value={country}
          onChangeText={setCountry}
          placeholder="e.g. South Africa"
          autoCapitalize="words"
          containerStyle={styles.fieldSpaced}
        />

        <FormInput
          label="WhatsApp number"
          icon="logo-whatsapp"
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="+27 68 123 4567"
          keyboardType="phone-pad"
          containerStyle={styles.fieldSpaced}
        />

        <Pressable
          style={styles.agreementRow}
          onPress={() => setAgreed((prev) => !prev)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={14} color={colors.text} />}
          </View>
          <Text style={styles.agreementText}>
            I agree to the <Text style={styles.link}>Terms & Conditions</Text>
            , acknowledge the <Text style={styles.link}>Risk Disclosure</Text>
            , and agree to the <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </Pressable>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.accentRed} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <PrimaryButton
          label={submitting ? 'Creating account...' : 'Create my free account'}
          onPress={handleContinue}
          disabled={submitting}
          style={styles.fieldSpaced}
        />
      </GlassCard>

      <WhatsAppHelpCard />

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Risk disclaimer</Text>
        <Text style={styles.disclaimer}>
          Representative of FSP No. 53590. Market observations and content
          shared are for educational and entertainment purposes only and do
          not constitute financial advice. Trading in financial markets
          involves risk and may result in the loss of some or all of your
          capital. Past performance is not indicative of future results.
          Always consult your own financial advisor before making any trading
          or investment decisions.
        </Text>
      </View>
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} JMONEY. All rights reserved.
      </Text>
    </ScreenShell>
  );
}

const PERKS: { icon: Icon3DName; label: string }[] = [
  { icon: 'alerts', label: 'Trade alerts' },
  { icon: 'courses', label: 'Free courses' },
  { icon: 'live', label: 'Live sessions' },
];

/** Numbered circle that leads a step card; turns into a tick when done. */
function StepNumber({ number, done = false }: { number: number; done?: boolean }) {
  return (
    <LinearGradient
      colors={done ? ['#2EE6A6', '#1FB985'] : gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.stepNumber}
    >
      {done ? (
        <Ionicons name="checkmark" size={18} color={colors.text} />
      ) : (
        <Text numeric style={styles.stepNumberText}>
          {number}
        </Text>
      )}
    </LinearGradient>
  );
}

/** One stop on the progress tracker above the steps. */
function StepDot({
  number,
  label,
  state,
}: {
  number: number;
  label: string;
  state: 'done' | 'active' | 'upcoming';
}) {
  return (
    <View style={styles.stepDotWrap}>
      <View
        style={[
          styles.stepDot,
          state === 'active' && styles.stepDotActive,
          state === 'done' && styles.stepDotDone,
        ]}
      >
        {state === 'done' ? (
          <Ionicons name="checkmark" size={14} color={colors.text} />
        ) : (
          <Text
            numeric
            style={[styles.stepDotText, state === 'upcoming' && { color: colors.textFaint }]}
          >
            {number}
          </Text>
        )}
      </View>
      <Text style={[styles.stepDotLabel, state === 'upcoming' && { color: colors.textFaint }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginTop: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: 14,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  perks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  perk: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  perkLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  stepLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.surfaceTrack,
    marginTop: 13,
    marginHorizontal: 8,
  },
  stepLineDone: {
    backgroundColor: colors.accentGreen,
  },
  stepDotWrap: {
    alignItems: 'center',
    gap: 6,
    width: 84,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glassTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.accentGreen,
  },
  stepDotText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  stepDotLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginTop: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  stepTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  stepDescription: {
    color: colors.textFaint,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  haveAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
  },
  haveAccountText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  haveAccountLink: {
    color: colors.accentGreen,
    fontWeight: '600',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  fieldSpaced: {
    marginTop: 16,
  },
  agreementRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreementText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  link: {
    color: colors.link,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,77,106,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    color: colors.accentRed,
    fontSize: 13,
  },
  disclaimerBox: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  disclaimerTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  disclaimer: {
    color: colors.textFaint,
    fontSize: 11,
    lineHeight: 16,
  },
  copyright: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  credentialLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  credentialValue: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  copyHint: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 10,
  },
});
