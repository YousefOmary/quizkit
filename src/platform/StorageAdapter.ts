/**
 * Platform-neutral key/value storage. The rest of the app only knows this
 * interface; the web and native implementations live beside it.
 */
export interface StorageAdapter {
  /** Read a value. Input: key. Output: the stored string, or null. */
  get(key: string): Promise<string | null>;
  /** Write a value. Input: key + string value. Output: none. */
  set(key: string, value: string): Promise<void>;
  /** Delete a value. Input: key. Output: none. Missing keys are fine. */
  remove(key: string): Promise<void>;
}
