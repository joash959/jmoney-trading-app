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
import Icon3D from './Icon3D';

type Props = {
  message: string;
  time: string;
  /** Posted in the last few minutes - gets a "NEW" marker. */
  isNew?: boolean;
  /** Collapsed: header row only, tap to show the price levels. */
  collapsed?: boolean;
  onToggle?: () => void;
  /** Where the trade stands now, from its updates (e.g. "TP1 hit"). */
  status?: { label: string; color: string; closed?: boolean };
  /** Follow-up messages for this trade, oldest first. */
  updates?: { id: string; message: string; time: string }[];
};

const GREEN_DIM = 'rgba(46,230,166,0.12)';
const RED_DIM = 'rgba(255,77,106,0.12)';

/** One trade alert: instrument + direction header, the alert's price levels
 * as tap-to-copy tiles, and any extra lines of the message below. */
export default function AlertCard({
  message,
  time,
  isNew = false,
  collapsed = false,
  onToggle,
  status,
  updates = [],
}: Props) {
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

  const canCollapse = !!onToggle && (fields.length > 0 || extraLines.length > 0 || updates.length > 0);
  const latestUpdate = updates[updates.length - 1];
  // A finished trade reads as finished: dimmed, with no copy buttons.
  const isClosed = !!status?.closed;

  return (
    <View style={[styles.card, isClosed && styles.cardClosed]}>
      <GlassSheen />
      {/* Live trades carry a BUY/SELL coloured edge. */}
      {!isClosed && direction && <View style={[styles.edge, { backgroundColor: tint }]} />}
      {isClosed && (
        <View style={styles.closedBanner}>
          <Ionicons
            name={status?.label === 'Stopped out' ? 'close-circle' : 'checkmark-circle'}
            size={15}
            color={status?.color}
          />
          <Text style={[styles.closedBannerText, { color: status?.color }]}>
            {status?.label} · this trade has ended
          </Text>
        </View>
      )}
      <Pressable
        style={styles.headerRow}
        onPress={onToggle}
        disabled={!canCollapse}
        hitSlop={4}
      >
        <View
          style={[
            styles.directionIcon,
          ]}
        >
          <Icon3D
            name={direction === 'long' ? 'chart-up' : direction === 'short' ? 'chart-down' : 'alerts'}
            size={38}
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
            <Text style={styles.meta}>{time}</Text>
            {status && (
              <View style={styles.statusChip}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            )}
          </View>
        </View>
        {direction && (
          <View style={[styles.directionPill, { backgroundColor: direction === 'long' ? GREEN_DIM : RED_DIM }]}>
            <Text style={[styles.directionText, { color: tint }]}>
              {direction === 'long' ? 'BUY' : 'SELL'}
            </Text>
          </View>
        )}
        {canCollapse && (
          <Ionicons
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={colors.textFaint}
          />
        )}
      </Pressable>

      {/* Collapsed: just the latest update, so the card stays one glance. */}
      {collapsed && latestUpdate && (
        <View style={styles.latestRow}>
          <Ionicons name="return-down-forward" size={14} color={colors.textFaint} />
          <Text style={styles.latestText} numberOfLines={1}>
            {latestUpdate.message.replace(/\s*\n\s*/g, ' ')}
          </Text>
          <Text style={styles.latestTime}>{latestUpdate.time}</Text>
        </View>
      )}

      {!collapsed && fields.length > 0 && (
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
                disabled={isClosed}
              >
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  {!isClosed && (
                    <Ionicons
                      name={copied ? 'checkmark' : 'copy-outline'}
                      size={11}
                      color={copied ? colors.accentGreen : colors.textFaint}
                    />
                  )}
                </View>
                <Text
                  numeric
                  style={[styles.fieldValue, { color: isClosed ? colors.textFaint : fieldTint }]}
                >
                  {field.value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {!collapsed && extraLines.length > 0 && (
        <Text style={styles.body}>{extraLines.join('\n')}</Text>
      )}

      {!collapsed && updates.length > 0 && (
        <View style={styles.timeline}>
          <Text style={styles.timelineLabel}>Updates</Text>
          {updates.map((update, i) => {
            const last = i === updates.length - 1;
            return (
              <View key={update.id} style={styles.timelineItem}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, last && status && { backgroundColor: status.color }]} />
                  {!last && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineText}>{update.message}</Text>
                  <Text style={styles.timelineTime}>{update.time}</Text>
                </View>
              </View>
            );
          })}
        </View>
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
  cardClosed: {
    opacity: 0.6,
  },
  edge: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  closedBannerText: {
    fontSize: 13,
    fontWeight: '600',
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
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  latestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  latestText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
  },
  latestTime: {
    color: colors.textFaint,
    fontSize: 12,
  },
  timeline: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  timelineLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineRail: {
    width: 10,
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    backgroundColor: colors.textFaint,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginVertical: 2,
    backgroundColor: colors.divider,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
  },
  timelineTime: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
});
