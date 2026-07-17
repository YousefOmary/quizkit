import { hashString, mulberry32, shuffled } from '../engine/rng.js';
import type { RoundSummary } from './progress.js';

/**
 * Daily goals: three deterministic, local, achievable objectives per date.
 * Everyone on the same date sees the same slate — no server involved.
 */

/** One goal definition. */
export interface MissionDef {
  id: string;
  label: string;
  target: number;
}

/** Slot 0 is always the Daily anchor; two more rotate in from this pool. */
const ANCHOR: MissionDef = { id: 'daily', label: 'Finish a Daily quiz', target: 1 };

const POOL: MissionDef[] = [
  { id: 'correct-12', label: 'Answer 12 questions correctly', target: 12 },
  { id: 'perfect', label: 'Get a perfect 5/5 round', target: 1 },
  { id: 'score-500', label: 'Score 500+ in one round', target: 1 },
  { id: 'rounds-3', label: 'Finish 3 rounds', target: 3 },
  { id: 'pure', label: 'Finish a round without lifelines', target: 1 },
  { id: 'combo-4', label: 'Hit a 4-answer combo', target: 1 },
];

/**
 * The three goals for a local date.
 * Input: 'YYYY-MM-DD'. Output: [anchor, rotating, rotating] — deterministic.
 */
export function missionsForDate(dateKey: string): MissionDef[] {
  const rng = mulberry32(hashString(`missions|${dateKey}`));
  return [ANCHOR, ...shuffled(POOL, rng).slice(0, 2)];
}

/** How much one finished round advances one goal. */
function gain(def: MissionDef, round: RoundSummary): number {
  switch (def.id) {
    case 'daily': return round.kind === 'daily' ? 1 : 0;
    case 'correct-12': return round.correct;
    case 'perfect': return round.total > 0 && round.correct === round.total ? 1 : 0;
    case 'score-500': return round.score >= 500 ? 1 : 0;
    case 'rounds-3': return 1;
    case 'pure': return round.usedLifeline ? 0 : 1;
    case 'combo-4': return round.maxCombo >= 4 ? 1 : 0;
    default: return 0;
  }
}

/** Result of folding one round into the day's goal progress. */
export interface MissionFold {
  progress: number[];
  /** Goals that crossed their target during this fold. */
  completed: MissionDef[];
}

/**
 * Advance goal progress with one finished round.
 * Input: today's defs, current raw progress (missing slots read as 0),
 * and the round. Output: new progress + goals completed by this round.
 * Completion is edge-triggered, so a goal never completes twice.
 */
export function applyMissions(
  defs: MissionDef[],
  progress: readonly number[],
  round: RoundSummary,
): MissionFold {
  const completed: MissionDef[] = [];
  const next = defs.map((def, slot) => {
    const before = progress[slot] ?? 0;
    const after = before + gain(def, round);
    if (before < def.target && after >= def.target) completed.push(def);
    return after;
  });
  return { progress: next, completed };
}
