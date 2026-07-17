import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ACHIEVEMENTS, newlyEarned } from '../src/product/achievements.js';
import { defaultProgress } from '../src/product/progress.js';

test('achievements: fresh profile earns nothing', () => {
  assert.deepEqual(newlyEarned({ progress: defaultProgress(), bestDailyStreak: 0 }), []);
});

test('achievements: thresholds unlock and never re-report', () => {
  const progress = defaultProgress();
  progress.counters.rounds = 1;
  progress.counters.perfect = 1;
  progress.counters.bestScore = 640;
  const earned = newlyEarned({ progress, bestDailyStreak: 3 });
  assert.deepEqual(
    earned.map((def) => def.id).sort(),
    ['first-steps', 'high-flyer', 'perfect-run', 'streak-3'],
  );
  for (const def of earned) progress.achievements[def.id] = '2026-07-17';
  assert.deepEqual(newlyEarned({ progress, bestDailyStreak: 3 }), [], 'recorded ids stay unlocked once');
});

test('achievements: breadth and lifetime conditions', () => {
  const progress = defaultProgress();
  progress.counters.modes = { 'multiple-choice': 1, 'true-false': 1, 'type-answer': 1, 'higher-lower': 1 };
  progress.counters.categories = { americas: 1, europe: 1, asia: 1, africa: 1 };
  progress.counters.correct = 100;
  progress.counters.missions = 10;
  progress.xp = 1000; // well past level 5
  const ids = newlyEarned({ progress, bestDailyStreak: 7 }).map((def) => def.id);
  for (const expected of ['globe-trotter', 'polymath', 'century', 'streak-3', 'streak-7', 'mission-master', 'level-5']) {
    assert.ok(ids.includes(expected), `${expected} earned`);
  }
});

test('achievements: definitions are unique and complete', () => {
  assert.equal(new Set(ACHIEVEMENTS.map((def) => def.id)).size, ACHIEVEMENTS.length);
  for (const def of ACHIEVEMENTS) assert.ok(def.name && def.description && def.icon);
});
