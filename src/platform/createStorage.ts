import { Capacitor } from '@capacitor/core';
import { CapacitorStorage } from './capacitorStorage.js';
import type { StorageAdapter } from './StorageAdapter.js';
import { WebStorage } from './webStorage.js';

/**
 * Pick the storage backend for the current platform.
 * Output: Capacitor Preferences on iOS/Android, localStorage on the web.
 */
export function createStorage(): StorageAdapter {
  return Capacitor.isNativePlatform() ? new CapacitorStorage() : new WebStorage();
}
