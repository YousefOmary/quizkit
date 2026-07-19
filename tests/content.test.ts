import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { McPack } from '../src/modes/multipleChoice.js';
import { CATEGORIES } from '../src/product/countries.js';
import { getPack } from '../src/product/packs.js';

test('content: 80 unique, complete country records', () => {
  const facts = CATEGORIES.flatMap((category) => category.facts);
  assert.equal(CATEGORIES.length, 4);
  assert.equal(facts.length, 80);
  assert.equal(new Set(facts.map((fact) => fact.name)).size, 80);
  assert.equal(new Set(facts.map((fact) => fact.capital)).size, 80);
  for (const fact of facts) {
    assert.ok(fact.flag && fact.capital && fact.area > 0);
  }
});

test('content: every generated round has enough unique questions', () => {
  for (const category of CATEGORIES) {
    for (const mode of ['multiple-choice', 'true-false', 'type-answer', 'higher-lower'] as const) {
      const pack = getPack(category, mode) as { questions: unknown[] };
      assert.ok(pack.questions.length >= 10, `${category.id}/${mode} supports a ten-question route`);
      assert.equal(new Set(pack.questions.map((question) => JSON.stringify(question))).size, pack.questions.length);
    }
  }
});

test('content: higher-lower pairs can never tie', () => {
  for (const category of CATEGORIES) {
    const areas = category.facts.map((fact) => fact.area);
    assert.equal(new Set(areas).size, areas.length, `${category.id} areas are all distinct`);
  }
});

test('content: type-answer aliases never duplicate another country’s capital', () => {
  const capitals = new Set(CATEGORIES.flatMap((c) => c.facts.map((f) => f.capital.toLowerCase())));
  for (const category of CATEGORIES) {
    for (const fact of category.facts) {
      for (const alias of fact.accepted ?? []) {
        const clash = [...capitals].filter((name) => name === alias.toLowerCase() && name !== fact.capital.toLowerCase());
        assert.deepEqual(clash, [], `alias '${alias}' is unambiguous`);
      }
    }
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
