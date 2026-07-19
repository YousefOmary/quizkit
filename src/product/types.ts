import type { ModeId, QuizKind, QuizState } from '../engine/types.js';
import type { IconName } from '../ui/icons.js';

/** Frozen v1 topic identifiers. New topics are additive after launch. */
export type CategoryId =
  | 'world-mix'
  | 'countries'
  | 'flags'
  | 'capitals'
  | 'landmarks'
  | 'nature'
  | 'map-sense';

/** Stable launch pack ids. These never change after v1 ships. */
export type ContentPackId =
  | 'countries-core-v1'
  | 'flags-shapes-v1'
  | 'capitals-cities-v1'
  | 'landmarks-v1'
  | 'nature-v1'
  | 'map-sense-v1';

export type Difficulty = 'foundation' | 'explorer' | 'expert';

/** One country cross-checked against UN/ISO and the final Factbook archive. */
export interface CountryRecord {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  capital: string;
  accepted: readonly string[];
  area: number;
  region: string;
  subregion: string;
  difficulty: Difficulty;
}

/** One UNESCO World Heritage property/location fact. */
export interface LandmarkRecord {
  id: string;
  name: string;
  country: string;
  difficulty: Difficulty;
}

/** Visual clue carried through the pure modes as serializable data. */
export interface FactVisual {
  kind: 'flag';
  code: string;
  alt: string;
}

/** Every playable atomic fact carries complete editorial provenance. */
export interface AtomicFact {
  id: string;
  packId: ContentPackId;
  difficulty: Difficulty;
  prompt: string;
  canonicalAnswer: string;
  acceptedVariants: readonly string[];
  explanation: string;
  statementTemplate: string;
  sourceUrl: string;
  sourceEdition: string;
  verifiedOn: string;
  verification: 'verified';
  ambiguityNote: string;
  localeNote: string;
  visual?: FactVisual;
}

/** A selectable knowledge topic and its visual identity. */
export interface Category {
  id: CategoryId;
  name: string;
  icon: IconName;
  accent: string;
  packId: ContentPackId | 'world-mix-v1';
  facts: readonly AtomicFact[];
  countries: readonly CountryRecord[];
}

/** Persistent player preferences. */
export interface Settings {
  /** 'system' follows the device; saved 'light'/'dark' values stay valid. */
  theme: 'light' | 'dark' | 'system';
  sound: boolean;
  music: boolean;
  haptics: boolean;
  /** In-app motion preference, in addition to the OS reduced-motion setting. */
  motion: boolean;
  /** Practice-round timer. The Daily is always timed for fair scores. */
  timer: boolean;
  onboardingSeen: boolean;
  categoryId: CategoryId;
  modeId: ModeId;
}

/** One-use assists stored with an in-progress quiz. */
export interface Lifelines {
  fifty: boolean;
  skip: boolean;
  time: boolean;
}

/** Exact resumable state around the pure engine state. */
export interface GameSession {
  version: 1;
  key: string;
  dateKey: string;
  categoryId: CategoryId;
  modeId: ModeId;
  kind: QuizKind;
  quiz: QuizState;
  lifelines: Lifelines;
  /** Choice indices removed by 50:50 on the current question. */
  eliminated: number[];
  timerLeft: number;
  /** Assisted rounds teach and grant XP but cannot set competitive bests. */
  assisted?: boolean;
  /** The optional one-question rewarded retry has already been claimed. */
  rewardedRetryUsed?: boolean;
  /** Prevents a restored finished round from being folded into stats twice. */
  recorded?: boolean;
}

/** Long-lived results for one topic/mode pairing. */
export interface ModeStats {
  played: number;
  correct: number;
  answered: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
}

/** Stats indexed by `${categoryId}:${modeId}`. */
export type StatsBook = Record<string, ModeStats>;

/** Cross-day daily-play streak. */
export interface DailyMeta {
  current: number;
  best: number;
  lastDate: string;
}
