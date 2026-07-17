import { audio } from '../audio/audioCore.js';
import { QuizEngine } from '../engine/engine.js';
import type { AnswerInput, Judgement } from '../engine/types.js';
import { getMode } from '../modes/index.js';
import { analytics, responseBucket } from '../platform/analytics.js';
import { haptics } from '../platform/haptics.js';
import type { ProductStore } from '../platform/productStore.js';
import { getCategory } from '../product/countries.js';
import { MODE_INFO, TIMINGS } from '../product/config.js';
import type { GameSession } from '../product/types.js';
import { PlayTimer } from './playTimer.js';
import { consumeLifeline } from './quizLifelines.js';
import { renderQuizView, type QuizViewHandle } from './quizView.js';

/** Navigation hooks around one active quiz. */
export interface PlayActions {
  onFinish: (session: GameSession) => void;
  onPause: () => void;
  onHelp: () => void;
}
/** Owns one timer/engine/view lifecycle, including pause and exact autosave. */
export class PlaySession {
  private readonly engine: QuizEngine;
  private view: QuizViewHandle | null = null;
  private readonly timer: PlayTimer;
  private transition: ReturnType<typeof setTimeout> | null = null;
  private awaiting = false;
  private paused = false;
  private hiddenPause = false;
  constructor(
    private readonly root: HTMLElement,
    readonly session: GameSession,
    private readonly store: ProductStore,
    private readonly actions: PlayActions,
  ) {
    this.engine = new QuizEngine(getMode(session.modeId), session.quiz);
    this.timer = new PlayTimer(
      session,
      store,
      (left) => this.view?.setTimer(left),
      () => this.submit(null),
    );
    this.onVisibility = this.onVisibility.bind(this);
  }
  /** Render and start or resume the current question. */
  start(): void {
    document.addEventListener('visibilitychange', this.onVisibility);
    this.showQuestion(true);
  }
  /** Freeze all callbacks and persist the exact remaining time. */
  pause(): void {
    if (this.paused) return;
    this.paused = true;
    this.session.timerLeft = this.timer.pause();
    if (this.transition) {
      clearTimeout(this.transition);
      this.transition = null;
    }
    void this.store.saveSession(this.session);
  }
  /** Continue a paused timer or answer reveal. */
  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    if (this.awaiting) this.scheduleAdvance(250);
    else this.timer.start(this.session.timerLeft);
  }
  /** Stop this session permanently before another screen owns the root. */
  dispose(): void {
    this.timer.stop();
    if (this.transition) clearTimeout(this.transition);
    this.view?.destroy();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
  private showQuestion(resume: boolean): void {
    const presented = this.engine.current();
    if (!presented) { this.finish(); return; }
    this.view?.destroy();
    const category = getCategory(this.session.categoryId);
    this.view = renderQuizView(this.root, {
      category: category.name,
      mode: MODE_INFO[this.session.modeId].label,
      index: this.session.quiz.index,
      total: this.session.quiz.questions.length,
      score: this.session.quiz.score,
      timerTotal: this.session.quiz.timerSeconds,
      presented,
      lifelines: this.session.lifelines,
      onAnswer: (input) => this.submit(input),
      onLifeline: (kind) => this.useLifeline(kind),
      onPause: () => { this.pause(); this.actions.onPause(); },
      onHelp: () => { this.pause(); this.actions.onHelp(); },
    });
    if (this.session.eliminated.length) this.view.eliminate(this.session.eliminated);
    this.timer.start(resume ? this.session.timerLeft : this.session.quiz.timerSeconds);
  }
  private submit(input: AnswerInput): void {
    if (this.awaiting || this.paused || this.engine.isFinished()) return;
    void audio.unlock();
    audio.tap();
    haptics.press();
    this.awaiting = true;
    const timeLeft = this.timer.pause();
    const judgement = this.engine.answer(input, timeLeft);
    const record = this.session.quiz.answers.at(-1)!;
    this.session.timerLeft = 0;
    this.reveal(input, judgement, record.points, record.multiplier ?? 1);
    analytics.track({
      name: 'answer_judged',
      correct: judgement.correct,
      bucket: responseBucket(timeLeft, this.session.quiz.timerSeconds),
    });
    if (judgement.correct) {
      audio.correct(this.session.quiz.streakInQuiz);
      haptics.correct();
      if ([3, 5].includes(this.session.quiz.streakInQuiz)) {
        audio.milestone();
        haptics.milestone();
      }
    } else {
      audio.wrong();
      haptics.wrong();
    }
    void this.store.saveSession(this.session);
    this.scheduleAdvance(TIMINGS.reveal);
  }
  private reveal(input: AnswerInput, judgement: Judgement, points: number, multiplier: number, skipped = false): void {
    this.view?.reveal({ input, judgement, points, multiplier, skipped }, this.session.quiz.score);
  }
  private useLifeline(kind: keyof GameSession['lifelines']): void {
    if (this.awaiting || this.paused || this.session.lifelines[kind]) return;
    void audio.unlock();
    const outcome = consumeLifeline(kind, this.session, this.engine, this.timer);
    if (!outcome) return;
    analytics.track({ name: 'lifeline_used', lifeline: kind });
    haptics.press();
    this.view?.updateLifelines(this.session.lifelines);
    if (outcome.eliminated) this.view?.eliminate(outcome.eliminated);
    if (outcome.judgement) {
      this.awaiting = true;
      this.reveal(null, outcome.judgement, 0, 1, true);
      audio.tap();
      this.scheduleAdvance(TIMINGS.reveal);
    } else audio.milestone();
    void this.store.saveSession(this.session);
  }
  private scheduleAdvance(delay: number): void {
    this.transition = setTimeout(() => {
      this.transition = null;
      if (this.paused) return;
      this.awaiting = false;
      this.session.eliminated = [];
      this.session.timerLeft = this.session.quiz.timerSeconds;
      this.engine.isFinished() ? this.finish() : this.showQuestion(false);
    }, delay);
  }
  private finish(): void {
    audio.complete();
    haptics.milestone();
    this.dispose();
    this.actions.onFinish(this.session);
  }
  private onVisibility(): void {
    if (document.hidden && !this.paused) { this.hiddenPause = true; this.pause(); }
    else if (!document.hidden && this.hiddenPause) { this.hiddenPause = false; this.resume(); }
  }
}
