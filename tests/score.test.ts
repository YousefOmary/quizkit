import assert from 'node:assert/strict';
import { test } from 'node:test';
import { answerPoints, scoreBreakdown } from '../src/engine/score.js';

test('score: wrong answers never score', () => {
  assert.deepEqual(scoreBreakdown(false, 9, 15, 15), { points: 0, timeBonus: 0, multiplier: 1 });
});

test('score: time bonus and combo multiplier are deterministic', () => {
  assert.deepEqual(scoreBreakdown(true, 0, 15, 15), { points: 150, timeBonus: 50, multiplier: 1 });
  assert.deepEqual(scoreBreakdown(true, 2, 15, 15), { points: 210, timeBonus: 50, multiplier: 1.4 });
  assert.equal(answerPoints(true, 99, 15, 15), 300);
  assert.equal(answerPoints(true, 0, 0, 0), 100);
});
