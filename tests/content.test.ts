import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import type { HlPack } from '../src/modes/higherLower.js';
import type { McPack } from '../src/modes/multipleChoice.js';
import {
  CATEGORIES, CONTENT_FACTS, CONTENT_SOURCES, COUNTRY_RECORDS, LANDMARK_RECORDS, PACK_MANIFEST,
} from '../src/product/countries.js';
import { getPack } from '../src/product/packs.js';

const DIFFICULTY_COUNTS = { foundation: 50, explorer: 35, expert: 15 };
const SOURCE_HOSTS = new Set(['unstats.un.org', 'www.iso.org', 'www.cia.gov', 'whc.unesco.org']);
const flagCss = readFileSync(resolve('src/styles/flags.css'), 'utf8');

function normalized(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

test('catalog: 100 unique countries and balanced difficulty tiers', () => {
  assert.equal(COUNTRY_RECORDS.length, 100);
  for (const field of ['id', 'name', 'iso2', 'iso3', 'capital', 'area'] as const) {
    assert.equal(new Set(COUNTRY_RECORDS.map((country) => country[field])).size, 100, `${field} is unique`);
  }
  assert.deepEqual(
    Object.fromEntries(Object.keys(DIFFICULTY_COUNTS).map((difficulty) => [
      difficulty, COUNTRY_RECORDS.filter((country) => country.difficulty === difficulty).length,
    ])),
    DIFFICULTY_COUNTS,
  );
  assert.equal(LANDMARK_RECORDS.length, 100);
});

test('catalog: frozen launch manifest contains six packs and 600 atomic facts', () => {
  assert.equal(PACK_MANIFEST.length, 6);
  assert.equal(new Set(PACK_MANIFEST.map((pack) => pack.id)).size, 6);
  assert.equal(CONTENT_FACTS.length, 600);
  assert.equal(new Set(CONTENT_FACTS.map((fact) => fact.id)).size, 600);
  for (const pack of PACK_MANIFEST) {
    assert.equal(pack.factCount, 100);
    assert.equal(pack.frozen, true);
    assert.equal(CONTENT_FACTS.filter((fact) => fact.packId === pack.id).length, 100, pack.id);
  }
});

test('catalog: every fact carries complete primary-source provenance', () => {
  assert.equal(Object.keys(CONTENT_SOURCES).length, 5);
  for (const fact of CONTENT_FACTS) {
    assert.ok(fact.prompt && fact.canonicalAnswer && fact.explanation && fact.statementTemplate, fact.id);
    assert.ok(fact.sourceEdition && fact.ambiguityNote && fact.localeNote, `${fact.id} has editorial notes`);
    assert.equal(fact.verifiedOn, '2026-07-19');
    assert.equal(fact.verification, 'verified');
    assert.ok(SOURCE_HOSTS.has(new URL(fact.sourceUrl).hostname), `${fact.id} uses an approved source`);
  }
});

test('catalog: representative capitals match the verified launch fixtures', () => {
  const expected: Record<string, string> = {
    CAN: 'Ottawa', USA: 'Washington D.C.', BRA: 'Brasília', GBR: 'London', FRA: 'Paris',
    RUS: 'Moscow', UKR: 'Kyiv', TUR: 'Ankara', EGY: 'Cairo', ETH: 'Addis Ababa',
    CHN: 'Beijing', JPN: 'Tokyo', IND: 'New Delhi', IDN: 'Jakarta', KOR: 'Seoul',
    AUS: 'Canberra', KAZ: 'Astana', MNG: 'Ulaanbaatar', BTN: 'Thimphu', MDG: 'Antananarivo',
  };
  for (const [iso3, capital] of Object.entries(expected)) {
    assert.equal(COUNTRY_RECORDS.find((country) => country.iso3 === iso3)?.capital, capital, iso3);
  }
});

test('catalog: input aliases are normalized, unique, and never repeat the answer', () => {
  for (const fact of CONTENT_FACTS) {
    const variants = fact.acceptedVariants.map(normalized);
    assert.ok(!variants.includes(normalized(fact.canonicalAnswer)), `${fact.id} does not repeat its answer`);
    assert.equal(new Set(variants).size, variants.length, `${fact.id} aliases are unique`);
  }
});

test('catalog: every launch flag has a local SVG atlas entry and accessible label', () => {
  const flagFacts = CONTENT_FACTS.filter((fact) => fact.packId === 'flags-shapes-v1');
  assert.equal(flagFacts.length, 100);
  for (const fact of flagFacts) {
    assert.equal(fact.visual?.kind, 'flag');
    assert.ok(fact.visual?.alt.includes(fact.canonicalAnswer));
    assert.match(flagCss, new RegExp(`\\.fi-${fact.visual?.code}\\s*\\{`));
  }
});

test('catalog: topics compose the frozen packs without changing their ids', () => {
  assert.equal(CATEGORIES.length, 7);
  assert.equal(CATEGORIES[0]?.id, 'world-mix');
  assert.equal(CATEGORIES[0]?.facts.length, 600);
  for (const category of CATEGORIES.slice(1)) assert.equal(category.facts.length, 100, category.id);
});

test('catalog: generated choice packs have one answer and three clean distractors', () => {
  const regionalIndicator = /[\u{1F1E6}-\u{1F1FF}]/u;
  for (const category of CATEGORIES) {
    const pack = getPack(category, 'multiple-choice') as McPack;
    for (const question of pack.questions) {
      assert.equal(question.wrong.length, 3);
      assert.equal(new Set([question.correct, ...question.wrong]).size, 4);
      assert.ok(question.explanation?.includes(question.correct));
      assert.doesNotMatch([question.correct, ...question.wrong].join(''), regionalIndicator);
    }
  }
});

test('catalog: every higher-lower matchup is tie-free and text-only', () => {
  for (const category of CATEGORIES) {
    const pack = getPack(category, 'higher-lower') as HlPack;
    assert.equal(pack.questions.length, 4_950);
    for (const question of pack.questions) {
      assert.notEqual(question.a.value, question.b.value);
      assert.doesNotMatch(`${question.a.label}${question.b.label}`, /[\u{1F1E6}-\u{1F1FF}]/u);
    }
  }
});
