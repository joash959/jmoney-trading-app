import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import Badge from '../components/Badge';
import GradientText from '../components/GradientText';
import GlassCard from '../components/GlassCard';
import FormInput from '../components/FormInput';
import SelectField from '../components/SelectField';
import PrimaryButton from '../components/PrimaryButton';
import WhatsAppHelpCard from '../components/WhatsAppHelpCard';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleOpenBroker = () => {
    // TODO: open PrimeXBT signup link via Linking.openURL
  };

  const handleContinue = () => {
    // TODO: wire up Supabase account creation here
  };

  return (
    <ScreenShell>
      <TopBar pillLabel="Log in" onPillPress={() => navigation.navigate('Login')} />

      <Text style={styles.eyebrow}>SIGN UP — IT'S FREE</Text>

      <View style={styles.heading}>
        <Text style={styles.headingLine}>Get free access</Text>
        <GradientText style={[styles.headingLine, styles.headingAccent]}>
          in two steps
        </GradientText>
      </View>
      <Text style={styles.subtitle}>
        Open a broker account, drop your details, and we'll send your JMONEY
        login by email and WhatsApp.
      </Text>

      <GlassCard style={styles.card}>
        <Badge icon="shield" label="Step 1 · Open broker account" />

        <View style={styles.cardHeading}>
          <Text style={styles.cardHeadingLine}>
            Open a PrimeXBT Broker account.{' '}
          </Text>
          <GradientText style={[styles.cardHeadingLine, styles.cardHeadingAccent]}>
            Free.
          </GradientText>
        </View>
        <Text style={styles.cardDescription}>
          Click below to open your free PrimeXBT trading account in a new
          tab.
        </Text>

        <PrimaryButton
          label="Open broker account"
          icon="external-link"
          onPress={handleOpenBroker}
          style={styles.brokerButton}
        />
        <Text style={styles.brokerCaption}>Opens in a new tab</Text>

        <View style={styles.divider} />

        <Pressable style={styles.haveAccountRow}>
          <Text style={styles.haveAccountText}>
            Already have a PrimeXBT account?{' '}
          </Text>
          <Feather name="message-circle" size={14} color={colors.accentGreen} />
          <Text style={styles.haveAccountLink}> WhatsApp us</Text>
        </Pressable>
      </GlassCard>

      <GlassCard style={[styles.card, styles.cardSpaced]}>
        <Badge icon="star" label="Step 2 · Enter your details" />

        <View style={styles.cardHeading}>
          <Text style={styles.cardHeadingLine}>A few quick details. </Text>
          <GradientText style={[styles.cardHeadingLine, styles.cardHeadingAccent]}>
            That's it.
          </GradientText>
        </View>
        <Text style={styles.cardDescription}>
          We'll create your free JMONEY account and show your login on the
          next screen.
        </Text>

        <View style={[styles.row, styles.fieldSpaced]}>
          <FormInput
            label="FIRST NAME"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            autoCapitalize="words"
            containerStyle={styles.rowField}
          />
          <FormInput
            label="LAST NAME"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            autoCapitalize="words"
            containerStyle={styles.rowField}
          />
        </View>

        <FormInput
          label="EMAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          containerStyle={styles.fieldSpaced}
        />

        <View style={[styles.row, styles.fieldSpaced]}>
          <SelectField
            label="COUNTRY"
            placeholder="Select country"
            containerStyle={styles.rowField}
          />
          <FormInput
            label="WHATSAPP / MOBILE"
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="WhatsApp/Mobile"
            keyboardType="phone-pad"
            containerStyle={styles.rowField}
          />
        </View>

        <Pressable
          style={styles.agreementBox}
          onPress={() => setAgreed((prev) => !prev)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Feather name="check" size={12} color={colors.text} />}
          </View>
          <Text style={styles.agreementText}>
            I agree to the <Text style={styles.link}>Terms & Conditions</Text>
            , acknowledge the <Text style={styles.link}>Risk Disclosure</Text>
            , and agree to the <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </Pressable>

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          style={styles.fieldSpaced}
        />
      </GlassCard>

      <WhatsAppHelpCard />

      <Text style={styles.disclaimer}>
        <Text style={styles.disclaimerBold}>Disclaimer: </Text>
        Representative of FSP No. 53590. Market observations and content
        shared are for educational and entertainment purposes only and do
        not constitute financial advice. Trading in financial markets
        involves risk and may result in the loss of some or all of your
        capital. Past performance is not indicative of future results.
        Always consult your own financial advisor before making any trading
        or investment decisions.
      </Text>
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} JMONEY. All rights reserved.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.link,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 20,
  },
  heading: {
    alignItems: 'center',
    marginTop: 12,
  },
  headingLine: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  headingAccent: {
    fontStyle: 'italic',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
  card: {
    marginTop: 24,
  },
  cardSpaced: {
    marginTop: 20,
  },
  cardHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  cardHeadingLine: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 27,
  },
  cardHeadingAccent: {
    fontStyle: 'italic',
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  brokerButton: {
    marginTop: 20,
  },
  brokerCaption: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginTop: 18,
    marginBottom: 16,
  },
  haveAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  haveAccountText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  haveAccountLink: {
    color: colors.accentGreen,
    fontWeight: '700',
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
    marginTop: 18,
  },
  agreementBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.accentBlue,
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
  disclaimer: {
    color: colors.textFaint,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: colors.textMuted,
  },
  copyright: {
    color: colors.textFaint,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});
