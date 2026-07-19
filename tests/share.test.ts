import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shareText } from '../src/engine/share.js';
import type { QuizState } from '../src/engine/types.js';

const state = {
  kind: 'daily',
  dayNumber: 142,
  answers: [
    { input: 2, correct: true, correctAnswer: 'SECRET OTTAWA', points: 100 },
    { input: 'PRIVATE INPUT', correct: false, correctAnswer: 'SECRET LIMA', points: 0 },
    { input: null, correct: false, correctAnswer: 'SECRET AMMAN', points: 0, skipped: true },
    { input: 0, correct: true, correctAnswer: 'SECRET PARIS', points: 100 },
    { input: 1, correct: true, correctAnswer: 'SECRET TOKYO', points: 100 },
  ],
} as QuizState;

test('viral share card: compact Daily number, result pattern, and streaks', () => {
  assert.equal(
    shareText('Atlas Sprint', state, 4, 9),
    'Atlas Sprint #142 · 3/5 🟩⬛🟨🟩🟩\nRoute streak 4 · Best 9',
  );
});

test('viral share card: never reveals inputs, questions, answers, score, or pack', () => {
  const text = shareText('Atlas Sprint', { ...state, score: 9999, packId: 'private-pack' }, 4, 9);
  for (const secret of ['SECRET', 'PRIVATE INPUT', '9999', 'private-pack']) {
    assert.equal(text.includes(secret), false, `${secret} is excluded`);
  }
});
