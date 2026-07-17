import type { StorageAdapter } from './StorageAdapter.js';

/**
 * Web storage backed by localStorage. Every call is wrapped in try/catch:
 * private-browsing modes and full disks throw, and losing a save must
 * never crash the game.
 */
export class WebStorage implements StorageAdapter {
  /** Read a key from localStorage; null on miss or storage error. */
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /** Write a key to localStorage; storage errors are swallowed. */
  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* quota / privacy mode — play on without persistence */
    }
  }

  /** Remove a key from localStorage; storage errors are swallowed. */
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
