import type { AnswerInput, Judgement, ModeId, Presented, QuizState } from './types.js';
import type { Rng } from './rng.js';

/**
 * The GameMode contract every rules module in modes/ implements.
 * The interface lives in engine/ so the engine never imports modes/;
 * modes/ depends on engine/, never the reverse.
 */

/** The four mode-specific behaviors a rules module must supply. */
export interface ModeCore {
  id: ModeId;
  /**
   * Build an ordered quiz from a question pack.
   * Input: the theme's pack, a seeded rng, and how many questions to pick.
   * Output: runtime questions in play order, JSON-serializable.
   * Contract: same pack + same seed ⇒ identical questions AND option order.
   */
  buildQuiz(pack: unknown, rng: Rng, count: number): unknown[];
  /** Shape one runtime question for display. Pure; no side effects. */
  present(question: unknown): Presented;
  /**
   * Judge one answer. Input: runtime question + player input.
   * Output: correctness plus the human-readable correct answer.
   */
  judge(question: unknown, input: AnswerInput): Judgement;
}

/** Full mode interface: core behaviors + state accessors. */
export interface GameMode extends ModeCore {
  /** The question at state.index, presented; null when the quiz is over. */
  current(state: QuizState): Presented | null;
  /** True once every question has been answered. */
  isFinished(state: QuizState): boolean;
  /** Total points earned so far. */
  score(state: QuizState): number;
}

/**
 * Wrap a ModeCore with the standard state accessors.
 * Input: a mode's core behaviors. Output: a complete GameMode.
 */
export function withStateHelpers(core: ModeCore): GameMode {
  return {
    ...core,
    current: (state) =>
      state.index < state.questions.length ? core.present(state.questions[state.index]) : null,
    isFinished: (state) => state.status === 'finished',
    score: (state) => state.score,
  };
}
