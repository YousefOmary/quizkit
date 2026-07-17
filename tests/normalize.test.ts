import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchesAnswer, normalizeAnswer } from '../src/engine/normalize.js';

test('normalizeAnswer: case folding', () => {
  assert.equal(normalizeAnswer('PARIS'), 'paris');
  assert.equal(normalizeAnswer('PaRiS'), 'paris');
});

test('normalizeAnswer: whitespace trimming and collapsing', () => {
  assert.equal(normalizeAnswer('  paris  '), 'paris');
  assert.equal(normalizeAnswer('new    york'), 'new york');
  assert.equal(normalizeAnswer('\tnew\nyork '), 'new york');
});

test('normalizeAnswer: accents stripped', () => {
  assert.equal(normalizeAnswer('Brasília'), 'brasilia');
  assert.equal(normalizeAnswer('Zürich'), 'zurich');
  assert.equal(normalizeAnswer('México'), 'mexico');
  assert.equal(normalizeAnswer('Ankara'), 'ankara');
  assert.equal(normalizeAnswer('Åland'), 'aland');
  assert.equal(normalizeAnswer('Chișinău'), 'chisinau');
});

test('normalizeAnswer: special letters folded to ASCII', () => {
  assert.equal(normalizeAnswer('Straße'), 'strasse');
  assert.equal(normalizeAnswer('Færøerne'), 'faeroerne');
  assert.equal(normalizeAnswer('Łódź'), 'lodz');
});

test('normalizeAnswer: punctuation collapsed to spaces', () => {
  assert.equal(normalizeAnswer('Washington, D.C.'), 'washington d c');
  assert.equal(normalizeAnswer('rock-and-roll'), 'rock and roll');
  assert.equal(normalizeAnswer('"quoted"'), 'quoted');
  assert.equal(normalizeAnswer('¿Cuál?'), 'cual');
});

test('normalizeAnswer: apostrophes removed, not spaced', () => {
  assert.equal(normalizeAnswer("O'Brien"), 'obrien');
  assert.equal(normalizeAnswer('O’Brien'), 'obrien');
  assert.equal(normalizeAnswer("Côte d'Ivoire"), 'cote divoire');
});

test('normalizeAnswer: ampersand becomes and', () => {
  assert.equal(normalizeAnswer('Tom & Jerry'), 'tom and jerry');
  assert.equal(normalizeAnswer('Trinidad&Tobago'), 'trinidad and tobago');
});

test('normalizeAnswer: digits preserved', () => {
  assert.equal(normalizeAnswer(' 42 '), '42');
  assert.equal(normalizeAnswer('Catch-22'), 'catch 22');
});

test('normalizeAnswer: degenerate inputs', () => {
  assert.equal(normalizeAnswer(''), '');
  assert.equal(normalizeAnswer('   '), '');
  assert.equal(normalizeAnswer('!!! ---'), '');
});

test('matchesAnswer: exact and normalized matches', () => {
  assert.equal(matchesAnswer('Paris', ['Paris']), true);
  assert.equal(matchesAnswer('  paris ', ['Paris']), true);
  assert.equal(matchesAnswer('BRASILIA', ['Brasília', 'Brasilia']), true);
  assert.equal(matchesAnswer("cote d'ivoire", ['Côte d’Ivoire']), true);
});

test('matchesAnswer: space-insensitive fallback', () => {
  assert.equal(matchesAnswer('washington dc', ['Washington, D.C.']), true);
  assert.equal(matchesAnswer('washingtondc', ['Washington, D.C.']), true);
  assert.equal(matchesAnswer('new york', ['NewYork']), true);
});

test('matchesAnswer: any entry in the accepted list matches', () => {
  const accepted = ['Washington, D.C.', 'Washington DC', 'Washington'];
  assert.equal(matchesAnswer('washington', accepted), true);
  assert.equal(matchesAnswer('washington d c', accepted), true);
});

test('matchesAnswer: wrong or empty input never matches', () => {
  assert.equal(matchesAnswer('London', ['Paris']), false);
  assert.equal(matchesAnswer('', ['Paris']), false);
  assert.equal(matchesAnswer('   ', ['Paris']), false);
  assert.equal(matchesAnswer('!!!', ['Paris']), false);
  assert.equal(matchesAnswer('new york city', ['New York']), false);
});
