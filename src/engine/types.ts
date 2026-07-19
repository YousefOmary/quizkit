/**
 * Core engine types. Pure data — zero DOM, fully JSON-serializable.
 */

/** Identifier of a rules module in modes/. */
export type ModeId = 'multiple-choice' | 'true-false' | 'type-answer' | 'higher-lower';

/** Kind of quiz: the shared daily puzzle, or endless free play. */
export type QuizKind = 'daily' | 'free';

/**
 * A player's answer to one question:
 * option index (choice modes), typed text (type-answer), or null (timeout).
 */
export type AnswerInput = number | string | null;

/** Serializable factual visual clue; UI decides how local assets render it. */
export interface PresentedVisual {
  kind: 'flag';
  code: string;
  alt: string;
}

/** A question shaped for display. Produced by a mode's present(). */
export interface Presented {
  /** Question text shown to the player. */
  prompt: string;
  /** 'choice' renders option buttons; 'text' renders a free-text input. */
  kind: 'choice' | 'text';
  /** Button labels for 'choice' questions; empty for 'text'. */
  options: string[];
  /** Short fact shown after the answer is judged. */
  explanation?: string;
  /** Optional offline visual clue, always paired with accessible text. */
  visual?: PresentedVisual;
}

/** Result of judging one answer. Produced by a mode's judge(). */
export interface Judgement {
  correct: boolean;
  /** Human-readable correct answer, shown as feedback. */
  correctAnswer: string;
  /** Index of the correct option, for choice modes only. */
  correctIndex?: number;
  /** Short, factual context for the reveal. */
  explanation?: string;
}

/** Record of one answered question, stored in QuizState. */
export interface AnswerRecord {
  input: AnswerInput;
  correct: boolean;
  correctAnswer: string;
  /** Points earned for this answer (base + time bonus + streak bonus). */
  points: number;
  /** Time component included in points. */
  timeBonus?: number;
  /** Combo multiplier applied to base points plus time bonus. */
  multiplier?: number;
  /** A lifeline skip records the question without breaking the combo. */
  skipped?: boolean;
}

/** Complete, serializable state of one quiz round. */
export interface QuizState {
  packId: string;
  modeId: ModeId;
  kind: QuizKind;
  /** Day number since the epoch (2026-01-01 = day 1); 0 for free play. */
  dayNumber: number;
  /** RNG seed the quiz was built from. */
  seed: number;
  /** Per-question timer in seconds; 0 means no timer. */
  timerSeconds: number;
  /** Mode-internal runtime questions, in play order. Serializable. */
  questions: unknown[];
  /** Index of the current unanswered question. */
  index: number;
  answers: AnswerRecord[];
  score: number;
  /** Consecutive correct answers within this quiz (drives streak bonus). */
  streakInQuiz: number;
  status: 'playing' | 'finished';
}

/** Long-lived per-player stats, persisted separately from quiz rounds. */
export interface Profile {
  bestScore: number;
  /** Consecutive days with a completed daily quiz. */
  dailyStreak: number;
  /** Day number of the most recent completed daily; 0 if never. */
  lastDailyDay: number;
}
