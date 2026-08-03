import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import AccentCard from '../components/AccentCard';
import GlassCard from '../components/GlassCard';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import PrizeTile from '../components/PrizeTile';
import LeaderboardRow from '../components/LeaderboardRow';
import DisclaimerCard from '../components/DisclaimerCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'Leaderboard'>;

const GOLD = '#F5C518';
const SILVER = '#C4C9D4';
const BRONZE = '#D97B3F';

export default function LeaderboardScreen({}: Props) {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [clientId, setClientId] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <ScreenShell overlay={<FloatingChatButton />}>
      <TopBar
        rightElement={
          <View style={styles.bellButton}>
            <Feather name="bell" size={18} color={colors.text} />
          </View>
        }
      />

      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Feather name="award" size={20} color={colors.link} />
        </View>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Challenge yourself with other traders and win your share of R30,000
      </Text>

      <AccentCard style={styles.cardSpaced}>
        <Text style={styles.heroTitle}>
          🏆 Enter The Millionaire League Challenge
        </Text>
        <Text style={styles.heroSubtitle}>Win your share of R30,000</Text>

        <View style={styles.podiumRow}>
          <View style={styles.podiumColumn}>
            <Text style={styles.podiumEmoji}>🥈</Text>
            <View style={[styles.podiumBar, styles.podiumSilver]}>
              <Text style={styles.podiumNumber}>2</Text>
            </View>
          </View>
          <View style={styles.podiumColumn}>
            <Text style={styles.podiumEmojiLarge}>🏆</Text>
            <View style={[styles.podiumBar, styles.podiumGold, styles.podiumTall]}>
              <Text style={styles.podiumNumber}>1</Text>
            </View>
          </View>
          <View style={styles.podiumColumn}>
            <Text style={styles.podiumEmoji}>🥉</Text>
            <View style={[styles.podiumBar, styles.podiumBronze]}>
              <Text style={styles.podiumNumber}>3</Text>
            </View>
          </View>
        </View>
      </AccentCard>

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="award" size={18} color={colors.link} />
          <Text style={styles.sectionHeading}>Prize Breakdown</Text>
        </View>

        <View style={styles.prizeRow}>
          <PrizeTile
            icon="award"
            iconColor={GOLD}
            label="1ST PLACE"
            amount="R20,000"
            amountColor={GOLD}
            backgroundColor="rgba(245,197,24,0.1)"
            borderColor="rgba(245,197,24,0.3)"
          />
          <PrizeTile
            icon="award"
            iconColor={SILVER}
            label="2ND PLACE"
            amount="R7,000"
            amountColor={colors.text}
            backgroundColor={colors.card}
            borderColor={colors.cardBorder}
          />
          <PrizeTile
            icon="award"
            iconColor={BRONZE}
            label="3RD PLACE"
            amount="R3,000"
            amountColor={BRONZE}
            backgroundColor="rgba(217,123,63,0.1)"
            borderColor="rgba(217,123,63,0.3)"
          />
        </View>

        <Text style={styles.poolText}>
          Total monthly prize pool: <Text style={styles.poolAmount}>R30,000</Text>
        </Text>
      </GlassCard>

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="user" size={18} color={colors.link} />
          <Text style={styles.sectionHeading}>Join the Challenge</Text>
        </View>

        <FormInput
          label="Full Name"
          icon="user"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          autoCapitalize="words"
          containerStyle={styles.fieldSpaced}
        />
        <FormInput
          label="Nickname"
          icon="user"
          value={nickname}
          onChangeText={setNickname}
          placeholder="Enter your trading nickname"
          containerStyle={styles.fieldSpaced}
        />
        <FormInput
          label="PrimeXBT Client ID or MT5 Number"
          icon="hash"
          value={clientId}
          onChangeText={setClientId}
          placeholder="e.g. 1824763 or 1040834"
          keyboardType="number-pad"
          containerStyle={styles.fieldSpaced}
        />

        <PrimaryButton
          label="Enter Challenge"
          icon={null}
          variant="flat"
          style={styles.fieldSpaced}
        />
      </GlassCard>

      <Pressable
        style={[styles.rulesRow, styles.cardSpaced]}
        onPress={() => setRulesOpen((prev) => !prev)}
      >
        <View style={styles.rulesLeft}>
          <Feather name="info" size={18} color={colors.link} />
          <Text style={styles.rulesTitle}>Rules</Text>
        </View>
        <Feather
          name={rulesOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textFaint}
        />
      </Pressable>
      {rulesOpen && (
        <Text style={styles.rulesBody}>
          Full challenge terms coming soon — check back here for eligibility
          and judging details.
        </Text>
      )}

      <GlassCard style={styles.cardSpaced}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="award" size={18} color={colors.link} />
          <Text style={styles.sectionHeading}>Top 20 Traders</Text>
        </View>

        <View style={styles.fieldSpaced}>
          <LeaderboardRow
            rankIconColor={GOLD}
            name="Raj"
            subtitle="Balraj Mahabeer"
            lots="0.00"
            badge={{ type: 'new' }}
          />
          <LeaderboardRow
            rankIconColor={SILVER}
            name="Nate dogg"
            subtitle="Nathan Jacobs"
            lots="0.00"
            badge={{ type: 'down', amount: 1 }}
          />
        </View>
      </GlassCard>

      <DisclaimerCard style={styles.cardSpaced} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    flexShrink: 1,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 10,
  },
  cardSpaced: {
    marginTop: 20,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
    marginTop: 28,
  },
  podiumColumn: {
    alignItems: 'center',
  },
  podiumEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  podiumEmojiLarge: {
    fontSize: 40,
    marginBottom: 8,
  },
  podiumBar: {
    width: 72,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumTall: {
    height: 88,
  },
  podiumGold: {
    backgroundColor: GOLD,
  },
  podiumSilver: {
    backgroundColor: SILVER,
  },
  podiumBronze: {
    backgroundColor: BRONZE,
  },
  podiumNumber: {
    color: '#0A0D16',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  prizeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  poolText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  poolAmount: {
    color: colors.link,
    fontWeight: '700',
  },
  fieldSpaced: {
    marginTop: 16,
  },
  rulesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rulesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rulesTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rulesBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    paddingHorizontal: 4,
  },
});
