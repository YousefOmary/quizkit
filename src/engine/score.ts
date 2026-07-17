/**
 * Scoring rules. Pure integer math so scores are identical on every device.
 */

/** Points for a correct answer before bonuses. */
export const BASE_POINTS = 100;

/** Maximum extra points for answering instantly on a timed question. */
export const MAX_TIME_BONUS = 50;

/** Extra multiplier added per prior consecutive correct answer. */
export const COMBO_STEP = 0.2;

/** Maximum score multiplier. */
export const MAX_MULTIPLIER = 2;

/** A transparent scoring result for UI feedback and persistence. */
export interface ScoreBreakdown {
  points: number;
  timeBonus: number;
  multiplier: number;
}

/** Compute every component of one answer's score. */
export function scoreBreakdown(
  correct: boolean,
  streakBefore: number,
  timeLeftSeconds: number,
  timerSeconds: number,
): ScoreBreakdown {
  if (!correct) return { points: 0, timeBonus: 0, multiplier: 1 };
  const fraction = timerSeconds > 0
    ? Math.min(Math.max(timeLeftSeconds / timerSeconds, 0), 1)
    : 0;
  const timeBonus = Math.round(MAX_TIME_BONUS * fraction);
  const multiplier = Math.min(1 + streakBefore * COMBO_STEP, MAX_MULTIPLIER);
  return {
    points: Math.round((BASE_POINTS + timeBonus) * multiplier),
    timeBonus,
    multiplier,
  };
}

/**
 * Points earned by one answer.
 * Inputs:
 *  - correct: whether the answer was right (wrong ⇒ 0 points, always).
 *  - streakBefore: consecutive correct answers immediately before this one.
 *  - timeLeftSeconds: seconds remaining when answered (0 if untimed).
 *  - timerSeconds: the question's full timer (0 ⇒ no time bonus).
 * Output: non-negative integer points.
 */
export function answerPoints(
  correct: boolean,
  streakBefore: number,
  timeLeftSeconds: number,
  timerSeconds: number,
): number {
  return scoreBreakdown(correct, streakBefore, timeLeftSeconds, timerSeconds).points;
}
