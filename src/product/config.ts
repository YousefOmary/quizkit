import type { ModeId } from '../engine/types.js';

/** Stable storage namespace for the standalone product. */
export const PRODUCT_ID = 'atlas-sprint';

/** Display name. */
export const PRODUCT_NAME = 'Atlas Sprint';

/** Ten-question routes are long enough to build momentum without becoming a grind. */
export const ROUND_SIZE = 10;

/** Default timed-question duration. */
export const TIMER_SECONDS = 15;

/** Extra seconds granted by the +Time lifeline. */
export const TIME_LIFELINE_SECONDS = 10;

/** Central motion and reveal timings in milliseconds. */
export const TIMINGS = {
  reveal: 1700,
  transition: 260,
  countUp: 850,
  toast: 1600,
} as const;

/** Player-facing information for every pure rules mode. */
export const MODE_INFO: Record<ModeId, { label: string; short: string; icon: string }> = {
  'multiple-choice': { label: 'Pick One', short: '4 choices', icon: 'choice' },
  'true-false': { label: 'True / False', short: 'Trust your gut', icon: 'boolean' },
  'type-answer': { label: 'Type It', short: 'No choices', icon: 'type' },
  'higher-lower': { label: 'Larger', short: 'Compare area', icon: 'compare' },
};

/** Product source note displayed offline in Settings. */
export const SOURCE_NOTE =
  'Capitals and total-area figures checked against the CIA World Factbook 2025 archive.';
