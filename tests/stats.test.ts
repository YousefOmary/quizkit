import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { QuizState } from '../src/engine/types.js';
import { defaultDailyMeta, defaultModeStats } from '../src/product/defaults.js';
import { applyDaily, applyRound } from '../src/product/stats.js';

const state = {
  score: 420,
  answers: [
    { input: 0, correct: true, correctAnswer: 'A', points: 100 },
    { input: 1, correct: true, correctAnswer: 'B', points: 120 },
    { input: null, correct: false, correctAnswer: 'C', points: 0, skipped: true },
    { input: 0, correct: false, correctAnswer: 'D', points: 0 },
  ],
} as QuizState;

test('stats: accuracy, best score, and skipped-streak behavior', () => {
  const result = applyRound(defaultModeStats(), state);
  assert.equal(result.played, 1);
  assert.equal(result.correct, 2);
  assert.equal(result.answered, 4);
  assert.equal(result.bestScore, 420);
  assert.equal(result.bestStreak, 2);
  assert.equal(result.currentStreak, 0);
});

test('daily streak: same day is idempotent, adjacent day increments', () => {
  const dayOne = applyDaily(defaultDailyMeta(), '2026-07-17');
  assert.deepEqual(applyDaily(dayOne, '2026-07-17'), dayOne);
  assert.equal(applyDaily(dayOne, '2026-07-18').current, 2);
  assert.equal(applyDaily(dayOne, '2026-07-20').current, 1);
});
