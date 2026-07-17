import type { Profile } from './types.js';

/**
 * Long-lived player stats: best score and the cross-day daily streak.
 * Pure functions — storage happens elsewhere.
 */

/** A brand-new profile: no best score, no streak. */
export function defaultProfile(): Profile {
  return { bestScore: 0, dailyStreak: 0, lastDailyDay: 0 };
}

/**
 * Fold a finished DAILY round into the profile.
 * Input: current profile, the day number just completed, and its score.
 * Output: a NEW profile — streak +1 if this day directly follows the last
 * completed day, unchanged if the same day is re-applied, else reset to 1.
 */
export function applyDailyResult(profile: Profile, dayNumber: number, score: number): Profile {
  let streak: number;
  if (dayNumber === profile.lastDailyDay) streak = profile.dailyStreak;
  else if (dayNumber === profile.lastDailyDay + 1) streak = profile.dailyStreak + 1;
  else streak = 1;
  return {
    bestScore: Math.max(profile.bestScore, score),
    dailyStreak: streak,
    lastDailyDay: dayNumber,
  };
}

/**
 * Fold a finished FREE round into the profile.
 * Input: current profile + the round's score.
 * Output: a NEW profile with bestScore raised if beaten; streak untouched.
 */
export function applyFreeResult(profile: Profile, score: number): Profile {
  return { ...profile, bestScore: Math.max(profile.bestScore, score) };
}
