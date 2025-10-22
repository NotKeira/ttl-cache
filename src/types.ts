/**
 * Represents a single entry in the cache with its value and expiration time.
 *
 * @template V - The type of the cached value
 */
export interface CacheEntry<V> {
    /**
     * The cached value
     */
    value: V;

    /**
     * Unix timestamp (in milliseconds) when this entry expires.
     * Set to Infinity for entries without TTL.
     */
    expiry: number;
}

/**
 * Configuration options for creating an LRU cache instance.
 */
export interface LRUCacheOptions {
    /**
     * Maximum number of entries the cache can hold.
     * When this limit is reached, the least recently used entry will be evicted.
     */
    maxSize: number;

    /**
     * Time-to-live for cache entries in milliseconds.
     * If not specified, entries will not expire based on time.
     *
     * @default undefined
     */
    ttl?: number;

    /**
     * Whether to use discord.js Collection as the underlying storage.
     * Requires discord.js to be installed as a peer dependency.
     *
     * @default false
     */
    useCollection?: boolean;
}