import assert from 'node:assert/strict';
import { test } from 'node:test';
import { responseBucket, type AnalyticsEvent } from '../src/platform/analytics.js';

test('responseBucket: coarse buckets only, never raw times', () => {
  assert.equal(responseBucket(0, 0), 'untimed');
  assert.equal(responseBucket(0, 15), 'timeout');
  assert.equal(responseBucket(14, 15), 'fast');
  assert.equal(responseBucket(8, 15), 'medium');
  assert.equal(responseBucket(2, 15), 'slow');
});

test('analytics events: answer payloads carry no player-entered text', () => {
  // The AnswerJudged payload is structurally closed: correctness + bucket.
  // This compiles only while the event type has no field for typed answers.
  const event: Extract<AnalyticsEvent, { name: 'answer_judged' }> = {
    name: 'answer_judged',
    correct: true,
    bucket: 'fast',
  };
  assert.deepEqual(Object.keys(event).sort(), ['bucket', 'correct', 'name']);
});
