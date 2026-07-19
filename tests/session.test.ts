import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QuizEngine } from '../src/engine/engine.js';
import { getMode, registerAllModes } from '../src/modes/index.js';
import type { StorageAdapter } from '../src/platform/StorageAdapter.js';
import { ProductStore } from '../src/platform/productStore.js';
import { CATEGORIES } from '../src/product/countries.js';
import { defaultSettings } from '../src/product/defaults.js';
import { createSession, sessionKey } from '../src/product/session.js';

class MemoryStorage implements StorageAdapter {
  readonly data = new Map<string, string>();
  async get(key: string): Promise<string | null> { return this.data.get(key) ?? null; }
  async set(key: string, value: string): Promise<void> { this.data.set(key, value); }
  async remove(key: string): Promise<void> { this.data.delete(key); }
}

registerAllModes();

test('daily session: deterministic per date, pack, and mode', () => {
  const settings = defaultSettings();
  const first = createSession(CATEGORIES[0]!, 'multiple-choice', 'daily', settings, new Date(2026, 6, 17));
  const second = createSession(CATEGORIES[0]!, 'multiple-choice', 'daily', settings, new Date(2026, 6, 17));
  assert.deepEqual(first.quiz.questions, second.quiz.questions);
  assert.equal(first.key, second.key);
});

test('daily session key: canonical across every selected practice setup', () => {
  const date = new Date(2026, 6, 17);
  const keys = CATEGORIES.flatMap((category) => [
    sessionKey('daily', category.id, 'multiple-choice', '2026-07-17'),
    sessionKey('daily', category.id, 'higher-lower', '2026-07-17'),
  ]);
  assert.equal(new Set(keys).size, 1);
  assert.equal(keys[0], 'daily:2026-07-17:canonical-v1');
  assert.equal(createSession(CATEGORIES[0]!, 'multiple-choice', 'daily', defaultSettings(), date).quiz.timerSeconds, 15);
});

test('new practice defaults to a relaxed pace', () => {
  const session = createSession(CATEGORIES[0]!, 'multiple-choice', 'free', defaultSettings());
  assert.equal(session.quiz.timerSeconds, 0);
});

test('save/restore: in-progress quiz retains answer, timer, and lifelines exactly', async () => {
  const storage = new MemoryStorage();
  const store = new ProductStore(storage);
  const session = createSession(CATEGORIES[1]!, 'multiple-choice', 'daily', defaultSettings(), new Date(2026, 6, 17));
  const mode = getMode(session.modeId);
  const engine = new QuizEngine(mode, session.quiz);
  const current = engine.current()!;
  const correct = current.options.findIndex((_, index) => mode.judge(session.quiz.questions[0], index).correct);
  engine.answer(correct, 8.75);
  session.timerLeft = 6.25;
  session.lifelines.fifty = true;
  session.eliminated = [1, 2];
  await store.saveSession(session);
  const restored = await store.loadActiveSession();
  assert.deepEqual(restored, session);
  assert.equal(restored?.quiz.index, 1);
  assert.equal(restored?.quiz.answers.length, 1);
  assert.equal(restored?.timerLeft, 6.25);
});
