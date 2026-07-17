import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { McPack } from '../src/modes/multipleChoice.js';
import { CATEGORIES } from '../src/product/countries.js';
import { getPack } from '../src/product/packs.js';

test('content: 24 unique, complete country records', () => {
  const facts = CATEGORIES.flatMap((category) => category.facts);
  assert.equal(CATEGORIES.length, 4);
  assert.equal(facts.length, 24);
  assert.equal(new Set(facts.map((fact) => fact.name)).size, 24);
  assert.equal(new Set(facts.map((fact) => fact.capital)).size, 24);
  for (const fact of facts) {
    assert.ok(fact.flag && fact.capital && fact.area > 0);
  }
});

test('content: generated choice packs have one answer and three unique distractors', () => {
  for (const category of CATEGORIES) {
    const pack = getPack(category, 'multiple-choice') as McPack;
    for (const question of pack.questions) {
      assert.equal(question.wrong.length, 3);
      assert.equal(new Set([question.correct, ...question.wrong]).size, 4);
      assert.ok(question.explanation?.includes(question.correct));
    }
  }
});
