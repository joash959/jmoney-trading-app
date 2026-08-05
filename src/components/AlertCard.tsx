import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { parseAlertFields } from '../lib/tradeAlertParser';

type Props = {
  message: string;
  time: string;
};

export default function AlertCard({ message, time }: Props) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const fields = parseAlertFields(message);

  const handleCopy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel((current) => (current === label ? null : current)), 1500);
  };

  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.sender}>JMONEY Trade Alerts</Text>
        <Text style={styles.message}>
          {message}
          <Text style={styles.time}>{'  '}{time}</Text>
        </Text>

        {fields.length > 0 && (
          <View style={styles.fieldsWrap}>
            {fields.map((field) => {
              const copied = copiedLabel === field.label;
              return (
                <Pressable
                  key={field.label}
                  style={({ pressed }) => [
                    styles.fieldChip,
                    copied && styles.fieldChipCopied,
                    pressed && styles.fieldChipPressed,
                  ]}
                  onPress={() => handleCopy(field.label, field.value)}
                >
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{field.value}</Text>
                  <Feather
                    name={copied ? 'check' : 'copy'}
                    size={11}
                    color={copied ? colors.accentGreen : colors.textFaint}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadows.sm,
  },
  sender: {
    color: colors.accentBlue,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  message: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '400',
  },
  fieldsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  fieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fieldChipCopied: {
    borderColor: 'rgba(37,211,102,0.4)',
    backgroundColor: 'rgba(37,211,102,0.1)',
  },
  fieldChipPressed: {
    opacity: 0.7,
  },
  fieldLabel: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '700',
  },
  fieldValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
