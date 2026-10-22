import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { detectAlertDirection, parseAlertFields } from '../lib/tradeAlertParser';
import GlassSheen from './GlassSheen';

type Props = {
  message: string;
  time: string;
  /** Posted in the last few minutes - gets a "NEW" marker. */
  isNew?: boolean;
};

const GREEN_DIM = 'rgba(46,230,166,0.12)';
const RED_DIM = 'rgba(255,77,106,0.12)';

/** One trade alert: instrument + direction header, the alert's price levels
 * as tap-to-copy tiles, and any extra lines of the message below. */
export default function AlertCard({ message, time, isNew = false }: Props) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const fields = parseAlertFields(message);
  const direction = detectAlertDirection(message);

  const lines = message.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ?? message;
  // Lines already shown as price tiles are dropped; anything else (e.g.
  // "Move SL to entry") is kept so no part of the alert is hidden.
  const extraLines = lines
    .slice(1)
    .filter((line) => parseAlertFields(line).length === 0);

  const handleCopy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel((current) => (current === label ? null : current)), 1500);
  };

  const tint =
    direction === 'long' ? colors.accentGreen : direction === 'short' ? colors.accentRed : colors.link;

  return (
    <View style={styles.card}>
      <GlassSheen />
      <View style={styles.headerRow}>
        <View
          style={[
            styles.directionIcon,
            { backgroundColor: colors.primaryDim },
          ]}
        >
          <Ionicons
            name={direction === 'long' ? 'trending-up' : direction === 'short' ? 'trending-down' : 'flash-outline'}
            size={18}
            color={colors.primary}
          />
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.metaRow}>
            {isNew && (
              <View style={styles.newPill}>
                <Text style={styles.newText}>NEW</Text>
              </View>
            )}
            <Text style={styles.meta}>JMONEY alert · {time}</Text>
          </View>
        </View>
        {direction && (
          <View style={[styles.directionPill, { backgroundColor: direction === 'long' ? GREEN_DIM : RED_DIM }]}>
            <Text style={[styles.directionText, { color: tint }]}>
              {direction === 'long' ? 'BUY' : 'SELL'}
            </Text>
          </View>
        )}
      </View>

      {fields.length > 0 && (
        <View style={styles.fieldsGrid}>
          {fields.map((field) => {
            const copied = copiedLabel === field.label;
            const fieldTint =
              field.label === 'SL' ? colors.accentRed : field.label.startsWith('TP') ? colors.accentGreen : colors.text;
            return (
              <Pressable
                key={field.label}
                style={({ pressed }) => [
                  styles.fieldTile,
                  copied && styles.fieldTileCopied,
                  pressed && styles.fieldTilePressed,
                ]}
                onPress={() => handleCopy(field.label, field.value)}
              >
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy-outline'}
                    size={11}
                    color={copied ? colors.accentGreen : colors.textFaint}
                  />
                </View>
                <Text numeric style={[styles.fieldValue, { color: fieldTint }]}>{field.value}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {extraLines.length > 0 && (
        <Text style={styles.body}>{extraLines.join('\n')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  directionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  newPill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  newText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  meta: {
    color: colors.textFaint,
    fontSize: 12,
  },
  directionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginTop: 14,
  },
  fieldTile: {
    width: '48.5%',
    backgroundColor: colors.glassTile,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldTileCopied: {
    borderColor: 'rgba(46,230,166,0.4)',
    backgroundColor: GREEN_DIM,
  },
  fieldTilePressed: {
    opacity: 0.7,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 3,
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
});
