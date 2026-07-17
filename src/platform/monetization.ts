/**
 * Dormant monetization boundary. This build ships NO ad SDK, no network
 * calls, and no ad UI — only the seam a future Capacitor build plugs into.
 * The game must behave perfectly when every method reports "not ready".
 * Placement rules live in product/adPolicy.ts, not in UI code.
 */

/** The only placements the product will ever request. */
export type AdPlacement = 'practice-rewarded-lifeline' | 'session-boundary-interstitial';

/** How an ad attempt ended. Failure and cancellation are normal paths. */
export type AdResult = 'completed' | 'dismissed' | 'failed' | 'unavailable';

/** The adapter gameplay-adjacent code talks to. Must never throw. */
export interface MonetizationAdapter {
  /** Whether a rewarded ad could be shown right now. */
  isRewardedReady(placement: AdPlacement): boolean;
  /** Show a rewarded ad; resolves with the verified outcome. */
  showRewarded(placement: AdPlacement): Promise<AdResult>;
  /** Show an interstitial at a session boundary; never blocks gameplay. */
  showInterstitial(placement: AdPlacement): Promise<AdResult>;
}

/** The shipped adapter: nothing is ever ready, nothing is ever shown. */
export class NoopMonetization implements MonetizationAdapter {
  isRewardedReady(): boolean {
    return false;
  }

  async showRewarded(): Promise<AdResult> {
    return 'unavailable';
  }

  async showInterstitial(): Promise<AdResult> {
    return 'unavailable';
  }
}

/** Shared dormant monetization adapter. */
export const monetization: MonetizationAdapter = new NoopMonetization();
