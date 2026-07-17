/**
 * Privacy-safe analytics boundary. Every event is typed and PII-free:
 * no names, no typed answer text, no identifiers. Production ships the
 * no-op adapter — nothing is collected or sent anywhere. A future build
 * can swap in a real adapter without touching gameplay code.
 */

/** Coarse response-time bucket — never the raw typed answer or exact ms. */
export type ResponseBucket = 'fast' | 'medium' | 'slow' | 'timeout' | 'untimed';

/** Every event the product may emit. Payloads stay non-identifying. */
export type AnalyticsEvent =
  | { name: 'onboarding_completed' }
  | { name: 'quiz_started'; kind: string; modeId: string; categoryId: string; timed: boolean }
  | { name: 'quiz_completed'; kind: string; modeId: string; categoryId: string; correct: number; total: number; score: number }
  | { name: 'answer_judged'; correct: boolean; bucket: ResponseBucket }
  | { name: 'lifeline_used'; lifeline: string }
  | { name: 'result_shared'; kind: string; outcome: string }
  | { name: 'mission_completed'; id: string }
  | { name: 'achievement_unlocked'; id: string }
  | { name: 'settings_changed'; key: string }
  | { name: 'ad_opportunity'; placement: string }
  | { name: 'ad_shown'; placement: string }
  | { name: 'ad_completed'; placement: string }
  | { name: 'ad_dismissed'; placement: string }
  | { name: 'ad_failed'; placement: string }
  | { name: 'ad_reward_granted'; placement: string };

/** The adapter the app talks to. Implementations must never throw. */
export interface AnalyticsAdapter {
  track(event: AnalyticsEvent): void;
}

/** Production adapter: collects nothing, sends nothing. */
class NoopAnalytics implements AnalyticsAdapter {
  track(): void {
    /* intentionally empty */
  }
}

/** Development adapter: local console echo only. */
class DevLogAnalytics implements AnalyticsAdapter {
  track(event: AnalyticsEvent): void {
    try {
      console.debug('[analytics]', event.name, event);
    } catch {
      /* never let logging break play */
    }
  }
}

/** Bucket a response time against its timer for the answer event. */
export function responseBucket(timeLeftSeconds: number, timerSeconds: number): ResponseBucket {
  if (timerSeconds <= 0) return 'untimed';
  if (timeLeftSeconds <= 0) return 'timeout';
  const used = 1 - timeLeftSeconds / timerSeconds;
  return used < 0.34 ? 'fast' : used < 0.67 ? 'medium' : 'slow';
}

/** True only under the Vite dev server (env typing kept build-agnostic). */
const IS_DEV = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

/** Shared analytics adapter: dev logger locally, no-op in production. */
export const analytics: AnalyticsAdapter = IS_DEV ? new DevLogAnalytics() : new NoopAnalytics();
