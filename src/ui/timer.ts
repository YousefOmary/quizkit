/**
 * Per-question countdown. Wall-clock based (not tick-counted) so it stays
 * accurate even when the browser throttles intervals.
 */
export class Countdown {
  private startedAt = 0;
  private remaining: number;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private expired = false;

  /**
   * Input: duration in seconds, a tick callback fired ~10×/s with seconds
   * remaining (for the timer bar), and an expire callback fired exactly
   * once when time runs out.
   */
  constructor(
    private readonly seconds: number,
    private readonly onTick: (secondsLeft: number) => void,
    private readonly onExpire: () => void,
  ) {
    this.remaining = seconds;
  }

  /** Start or restart from an optional saved duration. */
  start(seconds = this.seconds): void {
    this.stop();
    this.expired = false;
    this.remaining = Math.max(0, seconds);
    this.startedAt = Date.now();
    this.onTick(this.remaining);
    this.intervalId = setInterval(() => {
      const left = this.left();
      this.onTick(left);
      if (left <= 0 && !this.expired) {
        this.expired = true;
        this.stop();
        this.onExpire();
      }
    }, 100);
  }

  /** Seconds remaining, clamped to 0. Fractional. */
  left(): number {
    if (this.intervalId === null) return this.remaining;
    return Math.max(0, this.remaining - (Date.now() - this.startedAt) / 1000);
  }

  /** Pause and preserve exact remaining time. */
  pause(): number {
    this.remaining = this.left();
    this.stop();
    return this.remaining;
  }

  /** Resume after pause. */
  resume(): void {
    this.start(this.remaining);
  }

  /** Add seconds without creating a second timer. */
  add(seconds: number): void {
    this.remaining = this.left() + seconds;
    this.startedAt = Date.now();
    this.onTick(this.remaining);
  }

  /** Stop ticking. Safe to call repeatedly; onExpire will not fire after. */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
