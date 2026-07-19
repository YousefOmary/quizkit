import type { ModeId } from '../engine/types.js';
import type { CategoryId, GameSession } from './types.js';

/**
 * Player progression: XP, levels, titles, and category mastery.
 * Pure integer math — persistence and UI live elsewhere.
 */

/** Lifetime tallies that drive achievements and mastery. */
export interface ProgressCounters {
  rounds: number;
  perfect: number;
  correct: number;
  missions: number;
  bestScore: number;
  modes: Partial<Record<ModeId, number>>;
  categories: Partial<Record<CategoryId, number>>;
}

/** Persisted progression record. Additive — future versions only add keys. */
export interface ProgressState {
  version: 1;
  xp: number;
  counters: ProgressCounters;
  /** Achievement id → local date it was earned. */
  achievements: Record<string, string>;
  /** Local date the mission slate belongs to. */
  missionDate: string;
  /** Raw progress per mission slot for missionDate. */
  missionProgress: number[];
}

/** A brand-new progression record. */
export function defaultProgress(): ProgressState {
  return {
    version: 1,
    xp: 0,
    counters: { rounds: 0, perfect: 0, correct: 0, missions: 0, bestScore: 0, modes: {}, categories: {} },
    achievements: {},
    missionDate: '',
    missionProgress: [],
  };
}

/** XP earned by one finished round: score ÷ 10, at least 5 for showing up. */
export function xpForRound(score: number): number {
  return Math.max(5, Math.round(score / 10));
}

/** XP awarded per completed daily goal. */
export const MISSION_XP = 25;

/** XP needed to climb from `level` to `level + 1` (grows, then plateaus). */
export function xpStep(level: number): number {
  return Math.min(100 + (level - 1) * 50, 400);
}

/** Where an XP total lands: level, XP into it, and XP needed to level up. */
export interface LevelInfo {
  level: number;
  into: number;
  need: number;
}

/** Resolve an XP total to a level. Level 1 starts at 0 XP. */
export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let rest = Math.max(0, xp);
  while (rest >= xpStep(level)) {
    rest -= xpStep(level);
    level += 1;
  }
  return { level, into: rest, need: xpStep(level) };
}

const TITLES: Array<[number, string]> = [
  [15, 'Atlas Legend'], [10, 'Cartographer'], [6, 'Navigator'], [3, 'Traveler'], [1, 'Wanderer'],
];

/** Cosmetic title for a level. */
export function titleForLevel(level: number): string {
  return TITLES.find(([min]) => level >= min)?.[1] ?? 'Wanderer';
}

/** Mastery tiers per topic, by lifetime correct answers in that topic. */
export const MASTERY_TIERS: Array<{ name: string; correct: number }> = [
  { name: 'Scout', correct: 0 },
  { name: 'Bronze', correct: 25 },
  { name: 'Silver', correct: 70 },
  { name: 'Gold', correct: 150 },
];

/** Mastery tier name for a topic's lifetime correct-answer count. */
export function masteryTier(correct: number): string {
  return [...MASTERY_TIERS].reverse().find((tier) => correct >= tier.correct)!.name;
}

/** The facts about one finished round that progression systems consume. */
export interface RoundSummary {
  kind: 'daily' | 'free';
  modeId: ModeId;
  categoryId: CategoryId;
  correct: number;
  total: number;
  score: number;
  usedLifeline: boolean;
  maxCombo: number;
}

/** Distill a finished session into a RoundSummary. */
export function summarizeSession(session: GameSession): RoundSummary {
  const answers = session.quiz.answers;
  let combo = 0;
  let maxCombo = 0;
  for (const answer of answers) {
    if (answer.skipped) continue;
    combo = answer.correct ? combo + 1 : 0;
    maxCombo = Math.max(maxCombo, combo);
  }
  return {
    kind: session.kind,
    modeId: session.modeId,
    categoryId: session.categoryId,
    correct: answers.filter((answer) => answer.correct).length,
    total: answers.length,
    score: session.quiz.score,
    usedLifeline: Object.values(session.lifelines).some(Boolean),
    maxCombo,
  };
}

/** Fold one round into the lifetime counters. Returns a new object. */
export function applyCounters(counters: ProgressCounters, round: RoundSummary): ProgressCounters {
  return {
    rounds: counters.rounds + 1,
    perfect: counters.perfect + (round.total > 0 && round.correct === round.total ? 1 : 0),
    correct: counters.correct + round.correct,
    missions: counters.missions,
    bestScore: Math.max(counters.bestScore, round.score),
    modes: { ...counters.modes, [round.modeId]: (counters.modes[round.modeId] ?? 0) + 1 },
    categories: { ...counters.categories, [round.categoryId]: (counters.categories[round.categoryId] ?? 0) + 1 },
  };
}
