import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dailySeed, dayNumber, localDateKey } from '../src/engine/daily.js';
import { createQuizState } from '../src/engine/engine.js';
import type { GameMode } from '../src/engine/mode.js';
import type { ModeId } from '../src/engine/types.js';
import { higherLowerMode } from '../src/modes/higherLower.js';
import { multipleChoiceMode } from '../src/modes/multipleChoice.js';
import { trueFalseMode } from '../src/modes/trueFalse.js';
import { typeAnswerMode } from '../src/modes/typeAnswer.js';
import { CATEGORIES } from '../src/product/countries.js';
import { getPack } from '../src/product/packs.js';

const MODES: Record<ModeId, GameMode> = {
  'multiple-choice': multipleChoiceMode,
  'true-false': trueFalseMode,
  'type-answer': typeAnswerMode,
  'higher-lower': higherLowerMode,
};

function build(categoryIndex: number, modeId: ModeId, dateKey: string): unknown[] {
  const category = CATEGORIES[categoryIndex]!;
  const pack = getPack(category, modeId);
  return createQuizState({
    mode: MODES[modeId], pack, packId: pack.packId, modeId, kind: 'daily',
    seed: dailySeed(dateKey, pack.packId), dayNumber: 1,
    questionsPerRound: 5, timerSeconds: 0,
  }).questions;
}

test('dailySeed: stable for same date+pack, different across dates and packs', () => {
  assert.equal(dailySeed('2026-07-12', 'p1'), dailySeed('2026-07-12', 'p1'));
  assert.notEqual(dailySeed('2026-07-12', 'p1'), dailySeed('2026-07-13', 'p1'));
  assert.notEqual(dailySeed('2026-07-12', 'p1'), dailySeed('2026-07-12', 'p2'));
});

test('dayNumber and localDateKey: known dates', () => {
  assert.equal(dayNumber(new Date(2026, 0, 1)), 1);
  assert.equal(dayNumber(new Date(2026, 6, 12)), 193);
  assert.equal(localDateKey(new Date(2026, 6, 12)), '2026-07-12');
});

for (const [categoryIndex, category] of CATEGORIES.entries()) {
  for (const modeId of Object.keys(MODES) as ModeId[]) {
    test(`daily deterministic: ${category.id}/${modeId}`, () => {
      const first = build(categoryIndex, modeId, '2026-07-12');
      assert.equal(first.length, 5);
      assert.deepEqual(first, build(categoryIndex, modeId, '2026-07-12'));
      assert.notDeepEqual(first, build(categoryIndex, modeId, '2026-07-13'));
    });
  }
}
