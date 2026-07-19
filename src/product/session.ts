import { dailySeed, localDateKey } from '../engine/daily.js';
import { createQuizState } from '../engine/engine.js';
import type { ModeId, QuizKind } from '../engine/types.js';
import { getMode } from '../modes/index.js';
import { getPack } from './packs.js';
import { ROUND_SIZE, TIMER_SECONDS } from './config.js';
import type { Category, GameSession, Settings } from './types.js';

/** Frozen v1 canonical Daily route selection. Everyone gets this pack/mode. */
export const CANONICAL_DAILY_CATEGORY_ID = 'americas' as const;
export const CANONICAL_DAILY_MODE_ID: ModeId = 'multiple-choice';

/** Stable storage key for a selected daily or practice round. */
export function sessionKey(
  kind: QuizKind,
  categoryId: string,
  modeId: ModeId,
  date = localDateKey(),
): string {
  return kind === 'daily'
    ? `daily:${date}:canonical-v1`
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
  // The Daily uses fixed rules for everyone — the timer preference only
  // relaxes practice rounds, so canonical daily scores stay comparable.
  const timerSeconds = kind === 'daily' || settings.timer ? TIMER_SECONDS : 0;
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

/**
 * Build the one-question assisted retry unlocked after an optional rewarded
 * practice boundary. Daily sessions and perfect rounds can never enter.
 */
export function createPracticeRetry(source: GameSession): GameSession | null {
  if (source.kind !== 'free' || source.quiz.status !== 'finished' || source.rewardedRetryUsed) return null;
  const missed = source.quiz.answers.findIndex((answer) => !answer.correct && !answer.skipped);
  if (missed < 0) return null;
  const question = source.quiz.questions[missed];
  if (question === undefined) return null;
  return {
    version: 1,
    key: `practice-retry:${source.categoryId}:${source.modeId}:${source.dateKey}`,
    dateKey: source.dateKey,
    categoryId: source.categoryId,
    modeId: source.modeId,
    kind: 'free',
    assisted: true,
    rewardedRetryUsed: true,
    lifelines: { fifty: true, skip: true, time: true },
    eliminated: [],
    timerLeft: source.quiz.timerSeconds,
    quiz: {
      ...source.quiz,
      kind: 'free',
      dayNumber: 0,
      questions: [question],
      index: 0,
      answers: [],
      score: 0,
      streakInQuiz: 0,
      status: 'playing',
    },
  };
}

/** Day ordinal for a YYYY-MM-DD key, aligned with engine daily numbering. */
export function dayNumberForKey(key: string): number {
  const [year, month, day] = key.split('-').map(Number);
  const epoch = Date.UTC(2026, 0, 1);
  return Math.floor((Date.UTC(year!, month! - 1, day!) - epoch) / 86_400_000) + 1;
}
