import type { QuizEngine } from '../engine/engine.js';
import type { Judgement } from '../engine/types.js';
import { getMode } from '../modes/index.js';
import { TIME_LIFELINE_SECONDS } from '../product/config.js';
import type { GameSession, Lifelines } from '../product/types.js';
import type { PlayTimer } from './playTimer.js';

/** Targeted result of consuming a one-use lifeline. */
export interface LifelineOutcome {
  kind: keyof Lifelines;
  eliminated?: number[];
  judgement?: Judgement;
}

/** Consume a valid lifeline and mutate only session/engine state. */
export function consumeLifeline(
  kind: keyof Lifelines,
  session: GameSession,
  engine: QuizEngine,
  timer: PlayTimer,
): LifelineOutcome | null {
  if (kind === 'skip') {
    session.lifelines.skip = true;
    timer.pause();
    const judgement = engine.skip();
    session.timerLeft = 0;
    return { kind, judgement };
  }
  if (kind === 'time') {
    if (!timer.enabled || !timer.add(TIME_LIFELINE_SECONDS)) return null;
    session.lifelines.time = true;
    return { kind };
  }
  const presented = engine.current();
  // 50:50 needs >2 options: on a two-option question it would remove the
  // only wrong answer and hand the player a guaranteed win.
  if (!presented || presented.kind !== 'choice' || presented.options.length <= 2) return null;
  const mode = getMode(session.modeId);
  const question = session.quiz.questions[session.quiz.index];
  const wrong = presented.options.map((_, index) => index)
    .filter((index) => !mode.judge(question, index).correct);
  const removeCount = Math.max(1, Math.floor(wrong.length / 2) + (wrong.length > 2 ? 1 : 0));
  session.eliminated = wrong.slice(0, removeCount);
  session.lifelines.fifty = true;
  return { kind, eliminated: session.eliminated };
}
