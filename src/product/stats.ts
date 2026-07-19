import type { QuizState } from '../engine/types.js';
import { defaultModeStats } from './defaults.js';
import { dayNumberForKey } from './session.js';
import type { DailyMeta, ModeStats, StatsBook } from './types.js';

/** Stable lookup key for per-topic, per-mode statistics. */
export function statsKey(categoryId: string, modeId: string): string {
  return `${categoryId}:${modeId}`;
}

/** Read one stats row without mutating the book. */
export function getStats(book: StatsBook, categoryId: string, modeId: string): ModeStats {
  return book[statsKey(categoryId, modeId)] ?? defaultModeStats();
}

/** Fold a completed round into accuracy, best score, and answer streaks. */
export function applyRound(stats: ModeStats, state: QuizState, competitive = true): ModeStats {
  let currentStreak = stats.currentStreak;
  let bestStreak = stats.bestStreak;
  for (const answer of state.answers) {
    if (answer.skipped) continue;
    currentStreak = answer.correct ? currentStreak + 1 : 0;
    bestStreak = Math.max(bestStreak, currentStreak);
  }
  return {
    played: stats.played + 1,
    correct: stats.correct + state.answers.filter((answer) => answer.correct).length,
    answered: stats.answered + state.answers.length,
    bestScore: competitive ? Math.max(stats.bestScore, state.score) : stats.bestScore,
    currentStreak,
    bestStreak,
  };
}

/** Apply one daily completion, never counting the same local date twice. */
export function applyDaily(meta: DailyMeta, dateKey: string): DailyMeta {
  if (meta.lastDate === dateKey) return meta;
  const consecutive = meta.lastDate
    && dayNumberForKey(dateKey) === dayNumberForKey(meta.lastDate) + 1;
  const current = consecutive ? meta.current + 1 : 1;
  return { current, best: Math.max(meta.best, current), lastDate: dateKey };
}
