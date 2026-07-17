import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AD_RULES, canOfferRewarded, canShowInterstitial, RewardLedger } from '../src/product/adPolicy.js';

const MIN_GAP = AD_RULES.minMillisBetween;

test('interstitial: never before three completed sessions', () => {
  for (const completed of [0, 1, 2]) {
    assert.equal(
      canShowInterstitial({ completedSessions: completed, sessionsSinceInterstitial: 99, lastInterstitialAt: 0 }, MIN_GAP * 10),
      false,
    );
  }
  assert.equal(
    canShowInterstitial({ completedSessions: 3, sessionsSinceInterstitial: 3, lastInterstitialAt: 0 }, MIN_GAP * 10),
    true,
  );
});

test('interstitial: at most one per three sessions and one per eight minutes', () => {
  const now = 100 * 60_000;
  assert.equal(
    canShowInterstitial({ completedSessions: 10, sessionsSinceInterstitial: 2, lastInterstitialAt: 0 }, now),
    false, 'session spacing enforced',
  );
  assert.equal(
    canShowInterstitial({ completedSessions: 10, sessionsSinceInterstitial: 5, lastInterstitialAt: now - MIN_GAP + 1 }, now),
    false, 'time spacing enforced',
  );
  assert.equal(
    canShowInterstitial({ completedSessions: 10, sessionsSinceInterstitial: 5, lastInterstitialAt: now - MIN_GAP }, now),
    true,
  );
});

test('rewarded: practice only, never the canonical Daily', () => {
  assert.equal(canOfferRewarded('free'), true);
  assert.equal(canOfferRewarded('daily'), false);
});

test('reward ledger: each claim id grants exactly once, across restores', () => {
  const ledger = new RewardLedger();
  assert.equal(ledger.grant('claim-1'), true);
  assert.equal(ledger.grant('claim-1'), false);
  assert.equal(ledger.grant('claim-2'), true);
  const restored = new RewardLedger(new Set(ledger.toJSON()));
  assert.equal(restored.grant('claim-2'), false, 'persisted claims stay spent');
  assert.equal(restored.grant('claim-3'), true);
});
