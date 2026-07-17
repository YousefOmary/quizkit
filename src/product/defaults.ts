import type { DailyMeta, ModeStats, Settings } from './types.js';

/** Fresh preferences; future versions add keys without removing old ones. */
export function defaultSettings(): Settings {
  return {
    theme: 'system',
    sound: true,
    music: false,
    haptics: true,
    timer: true,
    onboardingSeen: false,
    categoryId: 'americas',
    modeId: 'multiple-choice',
  };
}

/** Empty stats for one region/mode pairing. */
export function defaultModeStats(): ModeStats {
  return { played: 0, correct: 0, answered: 0, bestScore: 0, currentStreak: 0, bestStreak: 0 };
}

/** Empty cross-day daily streak. */
export function defaultDailyMeta(): DailyMeta {
  return { current: 0, best: 0, lastDate: '' };
}
