import type { ModeId, QuizKind, QuizState } from '../engine/types.js';
import type { IconName } from '../ui/icons.js';

/** Region identifiers used for content, saves, and stats. */
export type CategoryId = 'americas' | 'europe' | 'asia' | 'africa';

/** One fact-checked country record. Areas are CIA total-area figures. */
export interface CountryFact {
  name: string;
  flag: string;
  capital: string;
  accepted?: string[];
  area: number;
}

/** A selectable region and its visual identity. */
export interface Category {
  id: CategoryId;
  name: string;
  icon: IconName;
  accent: string;
  facts: CountryFact[];
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

/** Long-lived results for one region/mode pairing. */
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
