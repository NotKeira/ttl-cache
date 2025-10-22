import type {CacheEntry, LRUCacheOptions} from '../types';
import {loadDiscordCollection} from '../utils';

/**
 * The Least Recently Used (LRU) cache implementation with optional TTL support.
 *
 * The cache automatically evicts the least recently used entries when the maximum
 * size is reached. Entries can also expire based on a configurable TTL.
 *
 * @template K - The type of keys in the cache
 * @template V - The type of values in the cache
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<string, number>({
 *   maxSize: 100,
 *   ttl: 60000, // 1 minute
 * });
 *
 * cache.set('key', 123);
 * const value = cache.get('key'); // 123
 * ```
 */
export class LRUCache<K, V> {
    private readonly maxSize: number;
    private readonly ttl: number | null;
    private readonly cache: Map<K, CacheEntry<V>>;
    private readonly keyOrder: K[];

    /**
     * Creates a new LRU cache instance.
     *
     * @param options - Configuration options for the cache
     * @throws {Error} If useCollection is true but discord.js is not installed
     */
    constructor(options: LRUCacheOptions) {
        this.maxSize = options.maxSize;
        this.ttl = options.ttl ?? null;
        this.keyOrder = [];

        if (options.useCollection) {
            const Collection = loadDiscordCollection();
            this.cache = new Collection() as Map<K, CacheEntry<V>>;
        } else {
            this.cache = new Map<K, CacheEntry<V>>();
        }
    }

    /**
     * Gets the current number of entries in the cache, excluding expired entries.
     *
     * This property automatically prunes expired entries before returning the count.
     *
     * @returns The number of valid entries in the cache
     *
     * @example
     * ```typescript
     * console.log(`Cache contains ${cache.size} entries`);
     * ```
     */
    get size(): number {
        this.pruneExpired();
        return this.cache.size;
    }

    /**
     * Adds or updates an entry in the cache.
     *
     * If the key already exists, its value is updated, and it's marked as most recently used.
     * If the cache is at maximum capacity, the least recently used entry is evicted.
     *
     * @param key - The key to set
     * @param value - The value to cache
     *
     * @example
     * ```typescript
     * cache.set('user:123', { name: 'Alice' });
     * ```
     */
    set(key: K, value: V): void {
        const expiry = this.ttl !== null ? Date.now() + this.ttl : Infinity;

        if (this.cache.has(key)) {
            this.moveToEnd(key);
        } else {
            if (this.cache.size >= this.maxSize) {
                this.evictOldest();
            }
            this.keyOrder.push(key);
        }

        this.cache.set(key, {value, expiry});
    }

    /**
     * Retrieves a value from the cache.
     *
     * Accessing a key marks it as most recently used. If the entry has expired,
     * it's automatically removed and undefined is returned.
     *
     * @param key - The key to retrieve
     * @returns The cached value, or undefined if not found or expired
     *
     * @example
     * ```typescript
     * const value = cache.get('user:123');
     * if (value) {
     *   console.log('Found:', value);
     * }
     * ```
     */
    get(key: K): V | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        if (this.isExpired(entry)) {
            this.delete(key);
            return undefined;
        }

        this.moveToEnd(key);
        return entry.value;
    }

    /**
     * Checks if a key exists in the cache and hasn't expired.
     *
     * @param key - The key to check
     * @returns True if the key exists and is valid, false otherwise
     *
     * @example
     * ```typescript
     * if (cache.has('user:123')) {
     *   console.log('User is cached');
     * }
     * ```
     */
    has(key: K): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        if (this.isExpired(entry)) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Removes an entry from the cache.
     *
     * @param key - The key to remove
     * @returns True if the entry was removed, false if it didn't exist
     *
     * @example
     * ```typescript
     * cache.delete('user:123');
     * ```
     */
    delete(key: K): boolean {
        const index = this.keyOrder.indexOf(key);
        if (index > -1) {
            this.keyOrder.splice(index, 1);
        }
        return this.cache.delete(key);
    }

    /**
     * Removes all entries from the cache.
     *
     * @example
     * ```typescript
     * cache.clear();
     * ```
     */
    clear(): void {
        this.cache.clear();
        this.keyOrder.length = 0;
    }

    /**
     * Returns an iterator of all keys in the cache.
     *
     * Expired entries are automatically pruned before iteration.
     *
     * @returns An iterator of cache keys
     *
     * @example
     * ```typescript
     * for (const key of cache.keys()) {
     *   console.log(key);
     * }
     * ```
     */
    keys(): IterableIterator<K> {
        this.pruneExpired();
        return this.cache.keys();
    }

    /**
     * Returns an iterator of all values in the cache.
     *
     * Expired entries are automatically pruned before iteration.
     *
     * @returns An iterator of cache values
     *
     * @example
     * ```typescript
     * for (const value of cache.values()) {
     *   console.log(value);
     * }
     * ```
     */
    values(): IterableIterator<V> {
        this.pruneExpired();
        const values: V[] = [];
        for (const entry of this.cache.values()) {
            if (!this.isExpired(entry)) {
                values.push(entry.value);
            }
        }
        return values[Symbol.iterator]();
    }

    /**
     * Returns an iterator of all key-value pairs in the cache.
     *
     * Expired entries are automatically pruned before iteration.
     *
     * @returns An iterator of [key, value] tuples
     *
     * @example
     * ```typescript
     * for (const [key, value] of cache.entries()) {
     *   console.log(key, value);
     * }
     * ```
     */
    entries(): IterableIterator<[K, V]> {
        this.pruneExpired();
        const entries: [K, V][] = [];
        for (const [key, entry] of this.cache) {
            if (!this.isExpired(entry)) {
                entries.push([key, entry.value]);
            }
        }
        return entries[Symbol.iterator]();
    }

    /**
     * Executes a provided function once for each cache entry.
     *
     * Expired entries are automatically pruned before iteration.
     *
     * @param callback - Function to execute for each entry
     *
     * @example
     * ```typescript
     * cache.forEach((value, key) => {
     *   console.log(`${key}: ${value}`);
     * });
     * ```
     */
    forEach(callback: (value: V, key: K, map: this) => void): void {
        this.pruneExpired();
        for (const [key, entry] of this.cache) {
            if (!this.isExpired(entry)) {
                callback(entry.value, key, this);
            }
        }
    }

    /**
     * Checks if a cache entry has expired.
     *
     * @param entry - The cache entry to check
     * @returns True if the entry has expired, false otherwise
     * @private
     */
    private isExpired(entry: CacheEntry<V>): boolean {
        return Date.now() > entry.expiry;
    }

    /**
     * Moves a key to the end of the access order (most recently used).
     *
     * @param key - The key to move
     * @private
     */
    private moveToEnd(key: K): void {
        const index = this.keyOrder.indexOf(key);
        if (index > -1) {
            this.keyOrder.splice(index, 1);
        }
        this.keyOrder.push(key);
    }

    /**
     * Evicts the oldest (least recently used) entry from the cache.
     *
     * @private
     */
    private evictOldest(): void {
        const oldest = this.keyOrder.shift();
        if (oldest !== undefined) {
            this.cache.delete(oldest);
        }
    }

    /**
     * Removes all expired entries from the cache.
     *
     * @private
     */
    private pruneExpired(): void {
        const keysToDelete: K[] = [];

        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry)) {
                keysToDelete.push(key);
            }
        }

        for (const key of keysToDelete) {
            this.delete(key);
        }
    }
}
