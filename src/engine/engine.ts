import { Emitter } from './events.js';
import type { GameMode } from './mode.js';
import { mulberry32 } from './rng.js';
import { scoreBreakdown } from './score.js';
import type { AnswerInput, Judgement, ModeId, Presented, QuizKind, QuizState } from './types.js';

/** Everything needed to start a fresh quiz round. */
export interface CreateQuizOptions {
  mode: GameMode;
  pack: unknown;
  packId: string;
  modeId: ModeId;
  kind: QuizKind;
  seed: number;
  /** Day number for daily quizzes; 0 for free play. */
  dayNumber: number;
  questionsPerRound: number;
  /** Per-question timer in seconds; 0 disables the timer. */
  timerSeconds: number;
}

/**
 * Build the initial state for a new quiz round.
 * Input: CreateQuizOptions. Output: a fresh, serializable QuizState.
 * Contract: deterministic — same options ⇒ identical state.
 */
export function createQuizState(options: CreateQuizOptions): QuizState {
  const rng = mulberry32(options.seed);
  return {
    packId: options.packId,
    modeId: options.modeId,
    kind: options.kind,
    dayNumber: options.dayNumber,
    seed: options.seed,
    timerSeconds: options.timerSeconds,
    questions: options.mode.buildQuiz(options.pack, rng, options.questionsPerRound),
    index: 0,
    answers: [],
    score: 0,
    streakInQuiz: 0,
    status: 'playing',
  };
}

/**
 * Drives one quiz round: holds state, applies answers, emits changes.
 * Pure logic — no DOM, no storage. Subscribers handle persistence/render.
 */
export class QuizEngine {
  /** Fires with the new state after every mutation (use for autosave + render). */
  readonly changed = new Emitter<QuizState>();

  constructor(
    private readonly mode: GameMode,
    readonly state: QuizState,
  ) {}

  /** The current question, presented for display; null when finished. */
  current(): Presented | null {
    return this.mode.current(this.state);
  }

  /** True once the round is complete. */
  isFinished(): boolean {
    return this.mode.isFinished(this.state);
  }

  /**
   * Answer the current question.
   * Input: player input (option index / text / null for timeout) and
   * seconds left on the question timer (0 if untimed or expired).
   * Output: the Judgement for immediate UI feedback.
   * Side effects: records the answer, updates score/streak, advances the
   * index, flips status to 'finished' after the last question, emits changed.
   */
  answer(input: AnswerInput, timeLeftSeconds = 0): Judgement {
    const state = this.state;
    if (state.status !== 'playing') {
      throw new Error('answer() called on a finished quiz');
    }
    const question = state.questions[state.index];
    const judgement = this.mode.judge(question, input);
    const score = scoreBreakdown(
      judgement.correct,
      state.streakInQuiz,
      timeLeftSeconds,
      state.timerSeconds,
    );
    state.answers.push({
      input,
      correct: judgement.correct,
      correctAnswer: judgement.correctAnswer,
      points: score.points,
      timeBonus: score.timeBonus,
      multiplier: score.multiplier,
    });
    state.streakInQuiz = judgement.correct ? state.streakInQuiz + 1 : 0;
    state.score += score.points;
    state.index += 1;
    if (state.index >= state.questions.length) state.status = 'finished';
    this.changed.emit(state);
    return judgement;
  }

  /** Skip the current question without points or breaking the combo. */
  skip(): Judgement {
    const state = this.state;
    if (state.status !== 'playing') throw new Error('skip() called on a finished quiz');
    const judgement = this.mode.judge(state.questions[state.index], null);
    state.answers.push({
      input: null,
      correct: false,
      correctAnswer: judgement.correctAnswer,
      points: 0,
      timeBonus: 0,
      multiplier: 1,
      skipped: true,
    });
    state.index += 1;
    if (state.index >= state.questions.length) state.status = 'finished';
    this.changed.emit(state);
    return judgement;
  }
}
