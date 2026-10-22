/** "WEEKLY SUMMARY" -> "Weekly summary". Only touches labels written fully
 * in capitals, and leaves two-letter tokens, known acronyms and anything with
 * symbols/digits alone, so "P&L ($)", "AI", "NFP" and "TP1" keep their casing. */
const KEEP_CAPS = new Set(['NFP', 'CPI', 'USD', 'ZAR', 'JMONEY']);

export function sentenceCase(text: string) {
  if (text !== text.toUpperCase() || !/[A-Z]/.test(text)) return text;
  const words = text.split(' ').map((word) =>
    /^[A-Z]{3,}$/.test(word) && !KEEP_CAPS.has(word) ? word.toLowerCase() : word
  );
  const result = words.join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}
