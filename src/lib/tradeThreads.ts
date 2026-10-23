import { colors } from '../theme/colors';
import { detectAlertDirection, parseAlertFields } from './tradeAlertParser';

export type AlertRow = { id: string; message: string; created_at: string };

export type TradeStatus = {
  label: string;
  color: string;
  /** No further updates expected (closed or stopped out). */
  closed: boolean;
};

/** One trade: the original Telegram signal plus every update posted for it. */
export type TradeThread = {
  id: string;
  instrument: string | null;
  direction: 'long' | 'short' | null;
  /** The signal message; null when updates arrived for a trade we never saw. */
  signal: AlertRow | null;
  /** Follow-ups (TP hit, SL moved, closed...), oldest first. */
  updates: AlertRow[];
  status: TradeStatus;
  /** Most recent activity - threads are listed newest first by this. */
  lastAt: string;
};

// Common names for the markets JMONEY trades, mapped to one display name.
const INSTRUMENT_ALIASES: { name: string; pattern: RegExp }[] = [
  { name: 'Gold', pattern: /\b(xau\s*\/?\s*usd|gold)\b/i },
  { name: 'Silver', pattern: /\b(xag\s*\/?\s*usd|silver)\b/i },
  { name: 'US30', pattern: /\b(us\s*30|dj\s*30|dow(\s*jones)?|wall\s*st(reet)?)\b/i },
  { name: 'NAS100', pattern: /\b(nas\s*100|us\s*100|ustec|nasdaq)\b/i },
  { name: 'SPX500', pattern: /\b(spx\s*500|us\s*500|s&p\s*500)\b/i },
  { name: 'BTC', pattern: /\b(btc\s*\/?\s*usdt?|bitcoin)\b/i },
  { name: 'ETH', pattern: /\b(eth\s*\/?\s*usdt?|ethereum)\b/i },
];

const CURRENCIES = 'USD|EUR|GBP|JPY|AUD|NZD|CAD|CHF';
const FX_PAIR = new RegExp(`\\b(${CURRENCIES})\\s*\\/?\\s*(${CURRENCIES})\\b`, 'i');

/** Which market a message is about, e.g. "Gold", "US30", "EURUSD". */
export function detectInstrument(message: string): string | null {
  for (const { name, pattern } of INSTRUMENT_ALIASES) {
    if (pattern.test(message)) return name;
  }
  const fx = message.match(FX_PAIR);
  if (fx && fx[1].toUpperCase() !== fx[2].toUpperCase()) {
    return `${fx[1]}${fx[2]}`.toUpperCase();
  }
  return null;
}

// Words that mark a follow-up on an open trade rather than a new signal.
const UPDATE_PATTERN =
  /\b(tp\s*\d?\s*(hit|reached|smashed)|take\s*profit\s*\d?\s*(hit|reached)|sl\s*(hit|moved|to|triggered|taken)|stop(\s*loss)?\s*(hit|moved|triggered)|stopped\s*out|move\s*(sl|stop)|break\s*-?\s*even|close[ds]?|closing|exit(ed|ing)?|secure|partials?|running|pips?|cancel(l?ed)?|invalidated?)\b/i;

function isUpdate(message: string) {
  return UPDATE_PATTERN.test(message);
}

/** A message that opens a trade: has a direction and isn't a follow-up. */
function isSignal(message: string) {
  if (isUpdate(message)) {
    // A full new setup (direction + entry level) still counts as a signal.
    return !!detectAlertDirection(message) && parseAlertFields(message).some((f) => f.label === 'Entry');
  }
  return !!detectAlertDirection(message);
}

// Trigger words that end a trade. Nothing else does: a signal stays active
// until one of these is posted for it (there is no time-based expiry).
const STOPPED_OUT = /\b(sl|stop(\s*loss)?)\s*(hit|triggered|taken)\b|\bstopped\s*out\b/i;
const CANCELLED = /\b(cancel(l?ed)?|invalidated?|void)\b/i;
const CLOSED = /\b(close[ds]?|closing|exit(ed|ing)?)\b/i;
// "Close/closing 50%", "close half", "closing partials", "SL close to entry"
// don't end it.
const NOT_A_FULL_CLOSE = /\b(close|closing)\s*(\d+\s*%|(half|some|partials?|part)\b)|\b(close|closing)\s*to\b|\bpartials?\s*closed\b/i;

const CLOSE_ALL = /\b(close|closing)\s*all\b/i;

function isFullClose(message: string) {
  // "Close all" always counts, even next to a partial-close phrase.
  if (CLOSE_ALL.test(message)) return true;
  return CLOSED.test(message) && !NOT_A_FULL_CLOSE.test(message);
}

/** Status of a trade from its latest meaningful update. */
function statusFor(updates: AlertRow[]): TradeStatus {
  for (let i = updates.length - 1; i >= 0; i -= 1) {
    const m = updates[i].message;
    if (STOPPED_OUT.test(m)) {
      return { label: 'Stopped out', color: colors.accentRed, closed: true };
    }
    if (CANCELLED.test(m)) {
      return { label: 'Cancelled', color: colors.textMuted, closed: true };
    }
    if (isFullClose(m)) {
      return { label: 'Closed', color: colors.textMuted, closed: true };
    }
    const tp = m.match(/\btp\s*(\d)?\s*(hit|reached|smashed)\b|\btake\s*profit\s*(\d)?\s*(hit|reached)\b/i);
    if (tp) {
      const n = tp[1] ?? tp[3];
      return { label: n ? `TP${n} hit` : 'TP hit', color: colors.accentGreen, closed: false };
    }
    if (/\bbreak\s*-?\s*even\b|\b(move|moved)\s*(sl|stop)\s*to\s*(entry|be)\b/i.test(m)) {
      return { label: 'SL at entry', color: colors.link, closed: false };
    }
  }
  return { label: 'Active', color: colors.accentGreen, closed: false };
}

// An update with no market named is linked to the latest trade only if it
// came within this window - otherwise it stands on its own.
const UNNAMED_UPDATE_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Groups raw Telegram alerts into trades. Each signal starts a trade; each
 * update joins the most recent trade on the same market (or, if it names
 * no market, the most recent trade overall). Returned newest activity first.
 */
export function buildTradeThreads(alerts: AlertRow[]): TradeThread[] {
  const oldestFirst = [...alerts].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const threads: TradeThread[] = [];

  for (const alert of oldestFirst) {
    const instrument = detectInstrument(alert.message);

    if (isSignal(alert.message)) {
      threads.push({
        id: alert.id,
        instrument,
        direction: detectAlertDirection(alert.message),
        signal: alert,
        updates: [],
        status: statusFor([]),
        lastAt: alert.created_at,
      });
      continue;
    }

    const at = new Date(alert.created_at).getTime();
    let parent: TradeThread | undefined;
    for (let i = threads.length - 1; i >= 0; i -= 1) {
      const t = threads[i];
      if (instrument ? t.instrument === instrument : at - new Date(t.lastAt).getTime() <= UNNAMED_UPDATE_WINDOW_MS) {
        parent = t;
        break;
      }
    }

    if (parent) {
      parent.updates.push(alert);
      parent.lastAt = alert.created_at;
      parent.status = statusFor(parent.updates);
    } else {
      // Update for a trade from before our window - show it on its own.
      threads.push({
        id: alert.id,
        instrument,
        direction: null,
        signal: null,
        updates: [alert],
        status: statusFor([alert]),
        lastAt: alert.created_at,
      });
    }
  }

  return threads.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
}
