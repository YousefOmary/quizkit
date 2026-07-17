/**
 * Free-text answer normalization for the type-answer mode.
 * Goal: "  Brasília! " and "brasilia" judge as the same answer.
 */

/** Letters NFD decomposition cannot fold to ASCII. */
const LETTER_MAP: Record<string, string> = {
  æ: 'ae',
  œ: 'oe',
  ø: 'o',
  ß: 'ss',
  đ: 'd',
  ð: 'd',
  þ: 'th',
  ł: 'l',
};

/**
 * Normalize a free-text answer for comparison.
 * Input: raw user text. Output: canonical form —
 * lowercase, diacritics stripped (é⇒e), special letters folded (ß⇒ss),
 * '&'⇒'and', apostrophes removed (o'brien⇒obrien), all other
 * punctuation collapsed to single spaces, trimmed.
 */
export function normalizeAnswer(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[æœøßđðþł]/g, (ch) => LETTER_MAP[ch] ?? ch)
    .replace(/&/g, ' and ')
    .replace(/['’ʼ`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s{2,}/g, ' ');
}

/**
 * Whether a typed answer matches any accepted answer.
 * Input: raw user text + the pack's acceptedAnswers list.
 * Output: true if the normalized input equals any normalized accepted
 * form, compared space-insensitively so 'washington dc' matches
 * 'Washington, D.C.' (which normalizes to 'washington d c').
 * Contract: an empty/whitespace-only input never matches.
 */
export function matchesAnswer(input: string, acceptedAnswers: readonly string[]): boolean {
  const compact = normalizeAnswer(input).replaceAll(' ', '');
  if (compact === '') return false;
  return acceptedAnswers.some((a) => normalizeAnswer(a).replaceAll(' ', '') === compact);
}
