import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyMissions, missionsForDate } from '../src/product/missions.js';
import type { RoundSummary } from '../src/product/progress.js';

const round = (over: Partial<RoundSummary> = {}): RoundSummary => ({
  kind: 'free', modeId: 'multiple-choice', categoryId: 'americas',
  correct: 3, total: 5, score: 320, usedLifeline: true, maxCombo: 3, ...over,
});

test('missionsForDate: deterministic, date-sensitive, daily anchor first', () => {
  const a = missionsForDate('2026-07-17');
  const b = missionsForDate('2026-07-17');
  assert.deepEqual(a, b);
  assert.equal(a.length, 3);
  assert.equal(a[0]!.id, 'daily');
  assert.equal(new Set(a.map((def) => def.id)).size, 3);
  const dates = ['2026-07-18', '2026-07-19', '2026-07-20', '2026-07-21'];
  const slates = dates.map((date) => missionsForDate(date).map((def) => def.id).join(','));
  assert.ok(new Set([a.map((d) => d.id).join(','), ...slates]).size > 1, 'slates rotate across dates');
});

test('applyMissions: gains accumulate and completion is edge-triggered', () => {
  const defs = [
    { id: 'daily', label: '', target: 1 },
    { id: 'correct-12', label: '', target: 12 },
    { id: 'rounds-3', label: '', target: 3 },
  ];
  const first = applyMissions(defs, [], round({ kind: 'daily', correct: 5 }));
  assert.deepEqual(first.progress, [1, 5, 1]);
  assert.deepEqual(first.completed.map((def) => def.id), ['daily']);
  const second = applyMissions(defs, first.progress, round({ kind: 'daily', correct: 5 }));
  assert.deepEqual(second.progress, [2, 10, 2]);
  assert.deepEqual(second.completed, [], 'the daily goal never completes twice');
  const third = applyMissions(defs, second.progress, round({ correct: 4 }));
  assert.deepEqual(third.completed.map((def) => def.id), ['correct-12', 'rounds-3']);
});

test('applyMissions: conditional goals only advance when earned', () => {
  const defs = [
    { id: 'perfect', label: '', target: 1 },
    { id: 'pure', label: '', target: 1 },
    { id: 'score-500', label: '', target: 1 },
    { id: 'combo-4', label: '', target: 1 },
  ];
  const miss = applyMissions(defs, [], round());
  assert.deepEqual(miss.progress, [0, 0, 0, 0]);
  const hit = applyMissions(defs, [], round({
    correct: 5, total: 5, usedLifeline: false, score: 640, maxCombo: 5,
  }));
  assert.deepEqual(hit.progress, [1, 1, 1, 1]);
  assert.equal(hit.completed.length, 4);
});
