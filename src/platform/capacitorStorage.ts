import { Preferences } from '@capacitor/preferences';
import type { StorageAdapter } from './StorageAdapter.js';

/**
 * Native storage backed by Capacitor Preferences (UserDefaults on iOS,
 * SharedPreferences on Android). All calls are wrapped in try/catch —
 * a storage failure must never crash the game.
 */
export class CapacitorStorage implements StorageAdapter {
  /** Read a key from Preferences; null on miss or plugin error. */
  async get(key: string): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      return null;
    }
  }

  /** Write a key to Preferences; plugin errors are swallowed. */
  async set(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch {
      /* play on without persistence */
    }
  }

  /** Remove a key from Preferences; plugin errors are swallowed. */
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch {
      /* ignore */
    }
  }
}
