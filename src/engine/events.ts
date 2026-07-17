/**
 * Minimal typed event emitter. The engine emits; the UI subscribes.
 * This is the only channel from engine/ to the outside world.
 */

/** Call to remove the listener registered by on(). */
export type Unsubscribe = () => void;

/** Single-event emitter carrying a payload of type T. */
export class Emitter<T> {
  private listeners: Array<(value: T) => void> = [];

  /**
   * Register a listener. Input: callback. Output: an unsubscribe function.
   */
  on(listener: (value: T) => void): Unsubscribe {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** Invoke every registered listener with the payload. */
  emit(value: T): void {
    for (const listener of this.listeners.slice()) listener(value);
  }
}
