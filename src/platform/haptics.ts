/**
 * Optional haptic feedback. Uses the Vibration API where present and is a
 * silent no-op everywhere else — gameplay never depends on it. A Capacitor
 * build can swap this file's singleton for a native implementation.
 */
export class Haptics {
  private enabled = true;

  /** Apply the persisted preference. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /** Feather-light tap acknowledgement. */
  press(): void {
    this.vibrate(8);
  }

  /** Short double pulse for a correct answer. */
  correct(): void {
    this.vibrate([12, 40, 16]);
  }

  /** One firmer buzz for a wrong answer. */
  wrong(): void {
    this.vibrate(60);
  }

  /** Celebration pattern for milestones and round completion. */
  milestone(): void {
    this.vibrate([10, 30, 10, 30, 24]);
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.enabled) return;
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* unsupported or blocked — stay silent */
    }
  }
}

/** Shared application haptics adapter. */
export const haptics = new Haptics();
