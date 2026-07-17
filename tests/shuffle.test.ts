import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashString, mulberry32, shuffled } from '../src/engine/rng.js';
import { multipleChoiceMode } from '../src/modes/multipleChoice.js';
import type { McPack } from '../src/modes/multipleChoice.js';
import { CATEGORIES } from '../src/product/countries.js';
import { getPack } from '../src/product/packs.js';

test('hashString: stable and input-sensitive', () => {
  assert.equal(hashString('2026-07-12|pack'), hashString('2026-07-12|pack'));
  assert.notEqual(hashString('a'), hashString('b'));
  assert.notEqual(hashString('ab'), hashString('ba'));
  assert.equal(hashString(''), 2166136261);
});

test('mulberry32: same seed ⇒ same sequence', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test('mulberry32: different seeds ⇒ different sequences', () => {
  const a = mulberry32(1);
  const b = mulberry32(2);
  const seqA = Array.from({ length: 10 }, () => a());
  const seqB = Array.from({ length: 10 }, () => b());
  assert.notDeepEqual(seqA, seqB);
});

test('shuffled: deterministic, non-mutating, a true permutation', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const frozen = items.slice();
  const first = shuffled(items, mulberry32(7));
  const second = shuffled(items, mulberry32(7));
  assert.deepEqual(items, frozen);
  assert.deepEqual(first, second);
  assert.deepEqual(first.slice().sort(), frozen.slice().sort());
});

test('multiple-choice option shuffle: deterministic order + correctIndex tracks the answer', () => {
  const pack = getPack(CATEGORIES[0]!, 'multiple-choice') as McPack;
  const first = multipleChoiceMode.buildQuiz(pack, mulberry32(123), 5) as Array<{
    prompt: string;
    options: string[];
    correctIndex: number;
  }>;
  const second = multipleChoiceMode.buildQuiz(pack, mulberry32(123), 5) as typeof first;
  assert.deepEqual(first, second);
  for (const q of first) {
    assert.equal(q.options.length, 4);
    const source = pack.questions.find((p) => p.prompt === q.prompt)!;
    assert.equal(q.options[q.correctIndex], source.correct);
    assert.deepEqual(
      q.options.slice().sort(),
      [source.correct, ...source.wrong].sort(),
    );
  }
});

test('multiple-choice option shuffle: different seed ⇒ different arrangement', () => {
  const pack = getPack(CATEGORIES[0]!, 'multiple-choice') as McPack;
  const a = multipleChoiceMode.buildQuiz(pack, mulberry32(1), 5);
  const b = multipleChoiceMode.buildQuiz(pack, mulberry32(2), 5);
  assert.notDeepEqual(a, b);
});
