/**
 * Central ad placement policy — the single source of truth a future ad
 * integration must consult. Pure and fully unit-tested now, while the
 * shipped MonetizationAdapter stays a no-op.
 */

/** Conservative interstitial caps. Tune here, never in UI code. */
export const AD_RULES = {
  /** No interstitial until this many sessions have ever been completed. */
  minSessionsBeforeFirst: 3,
  /** At most one interstitial per this many completed sessions. */
  sessionsBetween: 3,
  /** Never more often than this, regardless of session count. */
  minMillisBetween: 8 * 60_000,
} as const;

/** What the policy needs to know about ad history. */
export interface AdGateState {
  /** Sessions ever completed. */
  completedSessions: number;
  /** Sessions completed since the last interstitial. */
  sessionsSinceInterstitial: number;
  /** Epoch ms of the last interstitial; 0 if never shown. */
  lastInterstitialAt: number;
}

/**
 * Whether an interstitial may show at a completed-session boundary.
 * This is the only moment one may ever be requested — never during a
 * question, reveal, onboarding, the first session, or a celebration.
 */
export function canShowInterstitial(state: AdGateState, now: number): boolean {
  if (state.completedSessions < AD_RULES.minSessionsBeforeFirst) return false;
  if (state.sessionsSinceInterstitial < AD_RULES.sessionsBetween) return false;
  return now - state.lastInterstitialAt >= AD_RULES.minMillisBetween;
}

/**
 * Whether a rewarded offer may appear. Rewarded help is opt-in and
 * limited to non-competitive practice — it must never touch a canonical
 * Daily score, achievements, or deterministic fairness.
 */
export function canOfferRewarded(kind: 'daily' | 'free'): boolean {
  return kind === 'free';
}

/**
 * One-time reward granting. Each verified ad completion carries a claim
 * id; granting is idempotent so a retry, replayed callback, or reload can
 * never award the same reward twice.
 */
export class RewardLedger {
  constructor(private readonly claimed: Set<string> = new Set()) {}

  /** Grant a claim. Output: true only the first time this id is seen. */
  grant(claimId: string): boolean {
    if (this.claimed.has(claimId)) return false;
    this.claimed.add(claimId);
    return true;
  }

  /** Serializable claim ids for persistence. */
  toJSON(): string[] {
    return [...this.claimed];
  }
}
