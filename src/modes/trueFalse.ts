import { withStateHelpers, type GameMode } from '../engine/mode.js';
import { shuffled, type Rng } from '../engine/rng.js';
import type { AnswerInput, Judgement, Presented } from '../engine/types.js';

/** One true/false pack question: a statement and whether it is true. */
export interface TfPackQuestion {
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

/** The question pack a true/false theme supplies. */
export interface TfPack {
  packId: string;
  /** Button labels, e.g. ['Fact', 'Fiction']. Defaults to True/False. */
  labels?: [string, string];
  questions: TfPackQuestion[];
}

/** Runtime question: statement + truth + the pack's button labels. */
interface TfRuntime {
  statement: string;
  isTrue: boolean;
  labels: [string, string];
  explanation?: string;
}

/**
 * Build the round: deterministically pick `count` statements.
 * Input: TfPack + seeded rng + count. Output: ordered TfRuntime[].
 */
function buildQuiz(pack: unknown, rng: Rng, count: number): unknown[] {
  const p = pack as TfPack;
  const labels: [string, string] = p.labels ?? ['True', 'False'];
  return shuffled(p.questions, rng)
    .slice(0, Math.min(count, p.questions.length))
    .map((q): TfRuntime => ({ ...q, labels }));
}

/** Present: the statement plus two option buttons (option 0 = "true"). */
function present(question: unknown): Presented {
  const q = question as TfRuntime;
  return { prompt: q.statement, kind: 'choice', options: [...q.labels], explanation: q.explanation };
}

/**
 * Judge: input 0 claims the statement is true, 1 claims false
 * (null = timeout = wrong). Output: correctness + correct label and index.
 */
function judge(question: unknown, input: AnswerInput): Judgement {
  const q = question as TfRuntime;
  const correctIndex = q.isTrue ? 0 : 1;
  return {
    correct: input === correctIndex,
    correctAnswer: q.labels[correctIndex],
    correctIndex,
    explanation: q.explanation,
  };
}

/** True/false: a statement, two buttons. */
export const trueFalseMode: GameMode = withStateHelpers({
  id: 'true-false',
  buildQuiz,
  present,
  judge,
});
