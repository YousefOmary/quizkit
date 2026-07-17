import { hashString } from './rng.js';

/**
 * Daily-quiz date math. Day numbers count from the epoch below, using the
 * player's LOCAL calendar date (Wordle-style: the puzzle rolls at local
 * midnight, and everyone on the same date gets the same quiz).
 */

/** Day 1 of the daily quiz calendar (2026-01-01). */
const EPOCH_UTC = Date.UTC(2026, 0, 1);

const MS_PER_DAY = 86400000;

/**
 * Local calendar date as 'YYYY-MM-DD'.
 * Input: a Date (defaults to now). Output: zero-padded local date key.
 */
export function localDateKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Day number for a local date: 2026-01-01 ⇒ 1, counting up one per day.
 * Input: a Date (defaults to now). Output: integer day number.
 */
export function dayNumber(d: Date = new Date()): number {
  const localMidnight = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((localMidnight - EPOCH_UTC) / MS_PER_DAY) + 1;
}

/**
 * Deterministic seed for a daily quiz.
 * Input: 'YYYY-MM-DD' date key + packId. Output: 32-bit seed.
 * Contract: same date + same pack ⇒ same seed for every player, forever.
 */
export function dailySeed(dateKey: string, packId: string): number {
  return hashString(`${dateKey}|${packId}`);
}
