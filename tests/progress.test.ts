import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyCounters, defaultProgress, levelFromXp, masteryTier, summarizeSession,
  titleForLevel, xpForRound, xpStep,
} from '../src/product/progress.js';
import type { RoundSummary } from '../src/product/progress.js';
import type { GameSession } from '../src/product/types.js';

const round = (over: Partial<RoundSummary> = {}): RoundSummary => ({
  kind: 'free', modeId: 'multiple-choice', categoryId: 'countries',
  correct: 4, total: 5, score: 480, usedLifeline: false, maxCombo: 4, ...over,
});

test('xpForRound: score-driven with a floor of 5', () => {
  assert.equal(xpForRound(0), 5);
  assert.equal(xpForRound(480), 48);
  assert.equal(xpForRound(1234), 123);
});

test('levelFromXp: monotonic thresholds with a plateaued step', () => {
  assert.deepEqual(levelFromXp(0), { level: 1, into: 0, need: 100 });
  assert.deepEqual(levelFromXp(99), { level: 1, into: 99, need: 100 });
  assert.deepEqual(levelFromXp(100), { level: 2, into: 0, need: 150 });
  assert.deepEqual(levelFromXp(249), { level: 2, into: 149, need: 150 });
  assert.equal(xpStep(50), 400);
  assert.equal(levelFromXp(-10).level, 1);
});

test('titles and mastery tiers resolve as documented', () => {
  assert.equal(titleForLevel(1), 'Wanderer');
  assert.equal(titleForLevel(4), 'Traveler');
  assert.equal(titleForLevel(11), 'Cartographer');
  assert.equal(masteryTier(0), 'Scout');
  assert.equal(masteryTier(25), 'Bronze');
  assert.equal(masteryTier(149), 'Silver');
  assert.equal(masteryTier(150), 'Gold');
});

test('applyCounters: folds one round without mutating the input', () => {
  const base = defaultProgress().counters;
  const next = applyCounters(base, round({ correct: 5, total: 5, score: 700 }));
  assert.equal(base.rounds, 0);
  assert.equal(next.rounds, 1);
  assert.equal(next.perfect, 1);
  assert.equal(next.correct, 5);
  assert.equal(next.bestScore, 700);
  assert.equal(next.modes['multiple-choice'], 1);
  assert.equal(next.categories.countries, 1);
  const third = applyCounters(next, round({ correct: 3, score: 300 }));
  assert.equal(third.perfect, 1);
  assert.equal(third.bestScore, 700);
});

test('summarizeSession: correct counts, lifelines, and skip-safe combos', () => {
  const session = {
    kind: 'free', modeId: 'multiple-choice', categoryId: 'landmarks',
    lifelines: { fifty: true, skip: false, time: false },
    quiz: {
      score: 510,
      answers: [
        { correct: true }, { correct: true },
        { correct: false, skipped: true },
        { correct: true }, { correct: true },
      ],
    },
  } as unknown as GameSession;
  const summary = summarizeSession(session);
  assert.equal(summary.correct, 4);
  assert.equal(summary.total, 5);
  assert.equal(summary.usedLifeline, true);
  // The skip does not break the combo: 2 before + 2 after = 4 in a row.
  assert.equal(summary.maxCombo, 4);
});
