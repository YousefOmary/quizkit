import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QuizEngine } from '../src/engine/engine.js';
import { getMode, registerAllModes } from '../src/modes/index.js';
import type { StorageAdapter } from '../src/platform/StorageAdapter.js';
import { ProductStore } from '../src/platform/productStore.js';
import { CATEGORIES } from '../src/product/countries.js';
import { defaultDailyMeta, defaultSettings } from '../src/product/defaults.js';
import { defaultProgress, xpForRound, MISSION_XP } from '../src/product/progress.js';
import { recordResult } from '../src/product/recordResult.js';
import { createSession } from '../src/product/session.js';
import type { GameSession } from '../src/product/types.js';

class MemoryStorage implements StorageAdapter {
  readonly data = new Map<string, string>();
  async get(key: string): Promise<string | null> { return this.data.get(key) ?? null; }
  async set(key: string, value: string): Promise<void> { this.data.set(key, value); }
  async remove(key: string): Promise<void> { this.data.delete(key); }
}

registerAllModes();

/** Play a whole round, answering every question correctly. */
function completePerfect(session: GameSession): void {
  const mode = getMode(session.modeId);
  const engine = new QuizEngine(mode, session.quiz);
  while (!engine.isFinished()) {
    const question = session.quiz.questions[session.quiz.index];
    const options = engine.current()!.options;
    const correct = options.findIndex((_, index) => mode.judge(question, index).correct);
    engine.answer(correct, 0);
  }
}

const NOW = new Date(2026, 6, 17);

test('recordResult: folds stats, streak, XP, goals, and achievements once', async () => {
  const store = new ProductStore(new MemoryStorage());
  const session = createSession(CATEGORIES[0]!, 'multiple-choice', 'daily', defaultSettings(), NOW);
  completePerfect(session);
  const stats = {};
  const outcome = await recordResult(store, stats, defaultDailyMeta(), defaultProgress(), session, NOW);

  assert.equal(session.recorded, true);
  assert.equal(outcome.dailyMeta.current, 1);
  assert.equal(outcome.progress.counters.rounds, 1);
  assert.equal(outcome.progress.counters.perfect, 1);
  const missionXp = outcome.reward.missionsCompleted.length * MISSION_XP;
  assert.equal(outcome.reward.xpGained, xpForRound(session.quiz.score) + missionXp);
  assert.equal(outcome.progress.xp, outcome.reward.xpGained);
  // A perfect first round always earns these two.
  const ids = outcome.reward.achievementsUnlocked.map((def) => def.id);
  assert.ok(ids.includes('first-steps') && ids.includes('perfect-run'));
  // The daily anchor goal completed exactly once.
  assert.ok(outcome.reward.missionsCompleted.some((def) => def.id === 'daily'));

  // Persisted round-trip carries the recorded guard, preventing re-folds.
  const restored = await store.loadSession(session.key);
  assert.equal(restored?.recorded, true);
  const savedProgress = await store.loadProgress();
  assert.equal(savedProgress.xp, outcome.progress.xp);
});

test('recordResult: same-day daily reruns never regrow the streak', async () => {
  const store = new ProductStore(new MemoryStorage());
  const first = createSession(CATEGORIES[1]!, 'true-false', 'daily', defaultSettings(), NOW);
  completePerfect(first);
  const stats = {};
  const one = await recordResult(store, stats, defaultDailyMeta(), defaultProgress(), first, NOW);
  const second = createSession(CATEGORIES[2]!, 'true-false', 'daily', defaultSettings(), NOW);
  completePerfect(second);
  const two = await recordResult(store, stats, one.dailyMeta, one.progress, second, NOW);
  assert.equal(two.dailyMeta.current, 1, 'two dailies on one date still count as one day');
  assert.equal(two.progress.counters.rounds, 2);
});

test('storage: corrupt and partial saves fall back without data loss', async () => {
  const storage = new MemoryStorage();
  const store = new ProductStore(storage);
  await storage.set('quizkit:atlas-sprint:v1:progress', '{not json');
  const corrupt = await store.loadProgress();
  assert.equal(corrupt.xp, 0);
  await storage.set('quizkit:atlas-sprint:v1:progress', JSON.stringify({ xp: 70 }));
  const partial = await store.loadProgress();
  assert.equal(partial.xp, 70, 'legacy value kept');
  assert.equal(partial.counters.rounds, 0, 'missing nested keys read as defaults');
  assert.deepEqual(partial.missionProgress, []);
  await storage.set('quizkit:atlas-sprint:v1:settings', JSON.stringify({ theme: 'dark' }));
  const settings = await store.loadSettings();
  assert.equal(settings.theme, 'dark');
  assert.equal(settings.haptics, true, 'new keys are filled in additively');
});

test('daily fairness: the Daily is timed even when practice timer is off', () => {
  const relaxed = { ...defaultSettings(), timer: false };
  const daily = createSession(CATEGORIES[0]!, 'multiple-choice', 'daily', relaxed, NOW);
  assert.equal(daily.quiz.timerSeconds, 15);
  const practice = createSession(CATEGORIES[0]!, 'multiple-choice', 'free', relaxed, NOW);
  assert.equal(practice.quiz.timerSeconds, 0);
});
