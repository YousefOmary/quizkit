import { higherLowerMode } from './higherLower.js';
import { multipleChoiceMode } from './multipleChoice.js';
import { registerMode } from './registry.js';
import { trueFalseMode } from './trueFalse.js';
import { typeAnswerMode } from './typeAnswer.js';

export { getMode, registerMode } from './registry.js';

/**
 * Register every built-in mode. Call once at startup (main.ts) before
 * getMode() is used. Output: none. Safe to call more than once.
 */
export function registerAllModes(): void {
  registerMode(multipleChoiceMode);
  registerMode(trueFalseMode);
  registerMode(typeAnswerMode);
  registerMode(higherLowerMode);
}
