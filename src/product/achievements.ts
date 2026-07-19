import { levelFromXp, type ProgressState } from './progress.js';
import type { CategoryId } from './types.js';
import type { IconName } from '../ui/icons.js';

/**
 * A small set of meaningful, one-time achievements. Evaluated from real
 * lifetime performance — no grinding meters, no real-money economy.
 */

/** One achievement definition with its unlock test. */
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  earned: (ctx: AchievementCtx) => boolean;
}

/** Everything achievements may inspect. */
export interface AchievementCtx {
  progress: ProgressState;
  bestDailyStreak: number;
}

const LAUNCH_TOPICS: readonly CategoryId[] = [
  'countries', 'flags', 'capitals', 'landmarks', 'nature', 'map-sense',
];

/** Every achievement, in display order. */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-steps', name: 'First Steps', icon: 'route',
    description: 'Finish your first round.',
    earned: ({ progress }) => progress.counters.rounds >= 1 },
  { id: 'perfect-run', name: 'Perfect Run', icon: 'spark',
    description: 'Answer every question in a round correctly.',
    earned: ({ progress }) => progress.counters.perfect >= 1 },
  { id: 'globe-trotter', name: 'Pack Collector', icon: 'compass',
    description: 'Play all six topic packs.',
    earned: ({ progress }) => LAUNCH_TOPICS
      .every((id) => (progress.counters.categories[id] ?? 0) > 0) },
  { id: 'polymath', name: 'Polymath', icon: 'journey',
    description: 'Play all four modes.',
    earned: ({ progress }) => Object.keys(progress.counters.modes).length >= 4 },
  { id: 'century', name: 'Century Club', icon: 'award',
    description: 'Answer 100 questions correctly.',
    earned: ({ progress }) => progress.counters.correct >= 100 },
  { id: 'high-flyer', name: 'High Flyer', icon: 'pin',
    description: 'Score 600+ in a single round.',
    earned: ({ progress }) => progress.counters.bestScore >= 600 },
  { id: 'streak-3', name: 'Regular Route', icon: 'streak',
    description: 'Reach a 3-day daily streak.',
    earned: ({ bestDailyStreak }) => bestDailyStreak >= 3 },
  { id: 'streak-7', name: 'Week in Orbit', icon: 'world',
    description: 'Reach a 7-day daily streak.',
    earned: ({ bestDailyStreak }) => bestDailyStreak >= 7 },
  { id: 'mission-master', name: 'Goal Getter', icon: 'target',
    description: 'Complete 10 daily goals.',
    earned: ({ progress }) => progress.counters.missions >= 10 },
  { id: 'level-5', name: 'Seasoned Navigator', icon: 'map',
    description: 'Reach level 5.',
    earned: ({ progress }) => levelFromXp(progress.xp).level >= 5 },
];

/**
 * Which achievements are newly earned right now.
 * Input: evaluation context. Output: defs not yet in progress.achievements
 * whose condition holds — the caller records them so each unlocks once.
 */
export function newlyEarned(ctx: AchievementCtx): AchievementDef[] {
  return ACHIEVEMENTS.filter((def) => !ctx.progress.achievements[def.id] && def.earned(ctx));
}
