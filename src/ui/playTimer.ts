import { audio } from '../audio/audioCore.js';
import type { ProductStore } from '../platform/productStore.js';
import type { GameSession } from '../product/types.js';
import { Countdown } from './timer.js';

/** One leak-free question timer with throttled exact autosave. */
export class PlayTimer {
  private countdown: Countdown | null = null;
  private lastTick = -1;

  constructor(
    private readonly session: GameSession,
    private readonly store: ProductStore,
    private readonly onVisual: (left: number) => void,
    private readonly onExpire: () => void,
  ) {}

  /** Whether this saved round is timed. */
  get enabled(): boolean { return this.session.quiz.timerSeconds > 0; }

  /** Start a single fresh countdown from saved or full time. */
  start(seconds: number): void {
    this.stop();
    if (!this.enabled) return;
    this.lastTick = -1;
    this.countdown = new Countdown(
      this.session.quiz.timerSeconds,
      (left) => this.tick(left),
      this.onExpire,
    );
    this.countdown.start(seconds || this.session.quiz.timerSeconds);
  }

  /** Pause and return exact remaining seconds. */
  pause(): number {
    const left = this.countdown?.pause() ?? this.session.timerLeft;
    this.session.timerLeft = left;
    return left;
  }

  /** Add time to the one active countdown. */
  add(seconds: number): boolean {
    if (!this.countdown) return false;
    this.countdown.add(seconds);
    this.session.timerLeft = this.countdown.left();
    return true;
  }

  /** Stop callbacks without altering saved state. */
  stop(): void {
    this.countdown?.stop();
    this.countdown = null;
  }

  private tick(left: number): void {
    this.session.timerLeft = left;
    this.onVisual(left);
    const whole = Math.ceil(left);
    if (whole === this.lastTick) return;
    this.lastTick = whole;
    if (whole <= 5 && whole > 0) audio.tick(whole <= 3);
    void this.store.saveSession(this.session);
  }
}
