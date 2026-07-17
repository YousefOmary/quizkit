import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QuizEngine } from '../src/engine/engine.js';
import { getMode, registerAllModes } from '../src/modes/index.js';
import { CATEGORIES } from '../src/product/countries.js';
import { defaultSettings } from '../src/product/defaults.js';
import { createSession } from '../src/product/session.js';
import type { PlayTimer } from '../src/ui/playTimer.js';
import { consumeLifeline } from '../src/ui/quizLifelines.js';

registerAllModes();

const stubTimer = { enabled: false, add: () => false, pause: () => 0 } as unknown as PlayTimer;

function sessionFor(modeId: 'multiple-choice' | 'true-false' | 'higher-lower') {
  const session = createSession(CATEGORIES[0]!, modeId, 'free', defaultSettings(), new Date(2026, 6, 17));
  return { session, engine: new QuizEngine(getMode(modeId), session.quiz) };
}

test('50:50 removes exactly two options, both wrong, on multiple choice', () => {
  const { session, engine } = sessionFor('multiple-choice');
  const outcome = consumeLifeline('fifty', session, engine, stubTimer);
  assert.ok(outcome?.eliminated);
  assert.equal(outcome.eliminated.length, 2);
  const mode = getMode('multiple-choice');
  const question = session.quiz.questions[0];
  for (const index of outcome.eliminated) {
    assert.equal(mode.judge(question, index).correct, false, 'never eliminates the answer');
  }
  assert.equal(session.lifelines.fifty, true);
});

test('50:50 refuses two-option modes instead of handing a free win', () => {
  for (const modeId of ['true-false', 'higher-lower'] as const) {
    const { session, engine } = sessionFor(modeId);
    assert.equal(consumeLifeline('fifty', session, engine, stubTimer), null);
    assert.equal(session.lifelines.fifty, false, 'the lifeline is not consumed');
  }
});

test('skip records a non-scoring answer and consumes once', () => {
  const { session, engine } = sessionFor('multiple-choice');
  const outcome = consumeLifeline('skip', session, engine, stubTimer);
  assert.ok(outcome?.judgement);
  assert.equal(session.quiz.answers.length, 1);
  assert.equal(session.quiz.answers[0]!.skipped, true);
  assert.equal(session.quiz.answers[0]!.points, 0);
  assert.equal(session.quiz.streakInQuiz, 0);
  assert.equal(session.lifelines.skip, true);
});

test('+time is refused when the round is untimed', () => {
  const untimed = { ...defaultSettings(), timer: false };
  const free = createSession(CATEGORIES[0]!, 'multiple-choice', 'free', untimed, new Date(2026, 6, 17));
  const freeEngine = new QuizEngine(getMode('multiple-choice'), free.quiz);
  assert.equal(consumeLifeline('time', free, freeEngine, stubTimer), null);
  assert.equal(free.lifelines.time, false);
});
