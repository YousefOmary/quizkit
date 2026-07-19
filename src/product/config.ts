import type { ModeId } from '../engine/types.js';
import type { IconName } from '../ui/icons.js';

/** Stable storage namespace for the standalone product. */
export const PRODUCT_ID = 'atlas-sprint';

/** Display name. */
export const PRODUCT_NAME = 'Atlas Sprint';

/** Number of questions in daily and practice rounds. */
export const ROUND_SIZE = 5;

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
export const MODE_INFO: Record<ModeId, { label: string; short: string; icon: IconName }> = {
  'multiple-choice': { label: 'Pick One', short: 'Four choices', icon: 'target' },
  'true-false': { label: 'True / False', short: 'Two choices', icon: 'check' },
  'type-answer': { label: 'Type It', short: 'No choices', icon: 'type' },
  'higher-lower': { label: 'Larger', short: 'Compare area', icon: 'route' },
};

/** Product source note displayed offline in Settings. */
export const SOURCE_NOTE =
  '600 launch facts verified from UN M49, ISO 3166, the CIA World Factbook archive, and UNESCO.';
