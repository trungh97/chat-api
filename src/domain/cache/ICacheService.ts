export interface ICacheService {
  /**
   * Get a value from the cache.
   * @param {string} key The key of the value to retrieve.
   * @returns {Promise<T | null>} A promise that resolves with the value from the cache, or null if the key does not exist.
   * @template T The type of the value to retrieve.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in the cache.
   * @param {string} key The key of the value to set.
   * @param {T} value The value to set.
   * @param {number} [ttl] The time to live of the value in seconds. If not provided, the value will not expire.
   * @returns {Promise<void>} A promise that resolves when the value has been set in the cache.
   * @template T The type of the value to set.
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete a value from the cache.
   * @param {string} key The key of the value to delete.
   * @returns {Promise<void>} A promise that resolves when the value has been deleted from the cache.
   */
  delete(key: string): Promise<void>;
}
