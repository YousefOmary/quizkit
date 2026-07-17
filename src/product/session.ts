import { dailySeed, localDateKey } from '../engine/daily.js';
import { createQuizState } from '../engine/engine.js';
import type { ModeId, QuizKind } from '../engine/types.js';
import { getMode } from '../modes/index.js';
import { getPack } from './packs.js';
import { ROUND_SIZE, TIMER_SECONDS } from './config.js';
import type { Category, GameSession, Settings } from './types.js';

/** Stable storage key for a selected daily or practice round. */
export function sessionKey(
  kind: QuizKind,
  categoryId: string,
  modeId: ModeId,
  date = localDateKey(),
): string {
  return kind === 'daily'
    ? `daily:${date}:${categoryId}:${modeId}`
    : `practice:${categoryId}:${modeId}`;
}

/** Create a fresh wrapper around the unchanged pure quiz state. */
export function createSession(
  category: Category,
  modeId: ModeId,
  kind: QuizKind,
  settings: Settings,
  now: Date = new Date(),
): GameSession {
  const dateKey = localDateKey(now);
  const pack = getPack(category, modeId);
  const seed = kind === 'daily'
    ? dailySeed(dateKey, pack.packId)
    : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  const timerSeconds = settings.timer ? TIMER_SECONDS : 0;
  const key = sessionKey(kind, category.id, modeId, dateKey);
  return {
    version: 1,
    key,
    dateKey,
    categoryId: category.id,
    modeId,
    kind,
    lifelines: { fifty: false, skip: false, time: false },
    eliminated: [],
    timerLeft: timerSeconds,
    quiz: createQuizState({
      mode: getMode(modeId),
      pack,
      packId: pack.packId,
      modeId,
      kind,
      seed,
      dayNumber: kind === 'daily' ? dayNumberForKey(dateKey) : 0,
      questionsPerRound: ROUND_SIZE,
      timerSeconds,
    }),
  };
}

/** Day ordinal for a YYYY-MM-DD key, aligned with engine daily numbering. */
export function dayNumberForKey(key: string): number {
  const [year, month, day] = key.split('-').map(Number);
  const epoch = Date.UTC(2026, 0, 1);
  return Math.floor((Date.UTC(year!, month! - 1, day!) - epoch) / 86_400_000) + 1;
}
