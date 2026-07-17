import type { GameMode } from '../engine/mode.js';
import type { ModeId } from '../engine/types.js';

/**
 * Mode registry: themes name a modeId, the app looks the module up here.
 * Adding a new mode = one new file + one registerMode() call in index.ts.
 */

const registry = new Map<ModeId, GameMode>();

/**
 * Register a mode under its id.
 * Input: a complete GameMode. Output: none. Re-registering replaces.
 */
export function registerMode(mode: GameMode): void {
  registry.set(mode.id, mode);
}

/**
 * Look up a registered mode.
 * Input: a ModeId. Output: the GameMode. Throws if it was never registered.
 */
export function getMode(id: ModeId): GameMode {
  const mode = registry.get(id);
  if (!mode) throw new Error(`Unknown game mode: ${id}`);
  return mode;
}
