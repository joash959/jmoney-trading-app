export type AlertField = {
  label: string;
  value: string;
};

const FIELD_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: 'Entry', regex: /entry(?:\s*price)?\s*[:\-]?\s*([\d.,]+)/i },
  { label: 'TP1', regex: /(?:take\s*profit\s*1|tp\s*1|tp1)\s*[:\-]?\s*([\d.,]+)/i },
  { label: 'TP2', regex: /(?:take\s*profit\s*2|tp\s*2|tp2)\s*[:\-]?\s*([\d.,]+)/i },
  { label: 'SL', regex: /(?:stop\s*loss|sl)\s*[:\-]?\s*([\d.,]+)/i },
  {
    label: 'Current Price',
    regex: /current\s*price\s*[:\-]?\s*([\d.,]+)/i,
  },
];

/** Pulls Entry/TP1/TP2/SL/Current Price out of a free-form alert message, if present. */
export function parseAlertFields(message: string): AlertField[] {
  const fields: AlertField[] = [];
  for (const pattern of FIELD_PATTERNS) {
    const match = message.match(pattern.regex);
    if (match) {
      fields.push({ label: pattern.label, value: match[1] });
    }
  }
  return fields;
}

export function detectAlertDirection(message: string): 'long' | 'short' | null {
  if (/\b(buy|long)\b/i.test(message)) return 'long';
  if (/\b(sell|short)\b/i.test(message)) return 'short';
  return null;
}
