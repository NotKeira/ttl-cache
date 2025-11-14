import {LRUCache} from './lru';

/**
 * Namespaced cache wrapper for logical separation.
 *
 * @template K - The type of keys in the cache
 * @template V - The type of values in the cache
 *
 * @example
 * ```typescript
 * const cache = new LRUCache({ maxSize: 100 });
 * const userCache = cache.namespace('users');
 * const postCache = cache.namespace('posts');
 *
 * userCache.set('123', userData);
 * postCache.set('123', postData);
 * ```
 */
export class NamespacedCache<K, V> {
    constructor(
        private parent: LRUCache<string, V>,
        private prefix: string
    ) {
    }

    /**
     * Set a value in the namespaced cache.
     *
     * @param key - The key to set
     * @param value - The value to cache
     */
    set(key: K, value: V): void {
        this.parent.set(this.prefixKey(key), value);
    }

    /**
     * Set a value with custom TTL.
     *
     * @param key - The key to set
     * @param value - The value to cache
     * @param ttl - Custom TTL in milliseconds
     */
    setWithTTL(key: K, value: V, ttl: number): void {
        this.parent.setWithTTL(this.prefixKey(key), value, ttl);
    }

    /**
     * Get a value from the namespaced cache.
     *
     * @param key - The key to retrieve
     * @returns The cached value, or undefined if not found
     */
    get(key: K): V | undefined {
        return this.parent.get(this.prefixKey(key));
    }

    /**
     * Peek at a value without updating LRU.
     *
     * @param key - The key to peek at
     * @returns The cached value, or undefined if not found
     */
    peek(key: K): V | undefined {
        return this.parent.peek(this.prefixKey(key));
    }

    /**
     * Check if a key exists.
     *
     * @param key - The key to check
     * @returns True if the key exists and is valid
     */
    has(key: K): boolean {
        return this.parent.has(this.prefixKey(key));
    }

    /**
     * Delete a key.
     *
     * @param key - The key to remove
     * @returns True if the entry was removed
     */
    delete(key: K): boolean {
        return this.parent.delete(this.prefixKey(key));
    }

    /**
     * Get remaining TTL for a key.
     *
     * @param key - The key to check
     * @returns Remaining TTL in milliseconds
     */
    getTTL(key: K): number | null {
        return this.parent.getTTL(this.prefixKey(key));
    }

    /**
     * Update TTL for a key.
     *
     * @param key - The key to update
     * @param ttl - New TTL in milliseconds
     * @returns True if the entry was updated
     */
    touch(key: K, ttl?: number): boolean {
        return this.parent.touch(this.prefixKey(key), ttl);
    }

    /**
     * Get or compute a value.
     *
     * @param key - The key to get or compute
     * @param computeFn - Function to compute the value if not cached
     * @returns The cached or computed value
     */
    getOrCompute(key: K, computeFn: () => V | Promise<V>): V | Promise<V> {
        return this.parent.getOrCompute(this.prefixKey(key), computeFn);
    }

    /**
     * Clear all entries in this namespace.
     */
    clear(): void {
        this.parent.deleteByPattern(new RegExp(`^${this.prefix}:`));
    }

    /**
     * Create a prefixed key.
     *
     * @param key - Original key
     * @returns Prefixed key
     * @private
     */
    private prefixKey(key: K): string {
        return `${this.prefix}:${String(key)}`;
    }
}