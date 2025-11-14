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

    /**
     * Unix timestamp (in milliseconds) when this entry was created.
     * Used for absolute max TTL calculations.
     */
    createdAt: number;

    /**
     * Estimated size in bytes (used for memory-based eviction)
     */
    size?: number;
}

/**
 * Configuration options for creating an LRU cache instance.
 */
export interface LRUCacheOptions {
    /**
     * Maximum number of entries the cache can hold.
     * When this limit is reached, the least recently used entry will be evicted.
     * Can be omitted if maxMemoryBytes is specified.
     */
    maxSize?: number;

    /**
     * Maximum memory usage in bytes.
     * When this limit is reached, entries will be evicted until memory is available.
     */
    maxMemoryBytes?: number;

    /**
     * Time-to-live for cache entries in milliseconds.
     * If not specified, entries will not expire based on time.
     *
     * @default undefined
     */
    ttl?: number;

    /**
     * Whether to use sliding TTL. When enabled, accessing an entry
     * resets its TTL to the full duration.
     *
     * @default false
     */
    slidingTTL?: boolean;

    /**
     * Maximum absolute lifetime for entries in milliseconds.
     * Entries will be evicted after this time regardless of access.
     *
     * @default undefined
     */
    maxTTL?: number;

    /**
     * Whether to use discord.js Collection as the underlying storage.
     * Requires discord.js to be installed as a peer dependency.
     *
     * @default false
     */
    useCollection?: boolean;

    /**
     * Enable automatic background cleanup of expired entries.
     *
     * @default false
     */
    autoCleanup?: boolean;

    /**
     * Interval in milliseconds for automatic cleanup.
     * Only used when autoCleanup is enabled.
     *
     * @default 60000 (1 minute)
     */
    cleanupInterval?: number;

    /**
     * Enable cache statistics tracking.
     *
     * @default false
     */
    enableStats?: boolean;
}

/**
 * Cache statistics information
 */
export interface CacheStats {
    /**
     * Number of successful cache hits
     */
    hits: number;

    /**
     * Number of cache misses
     */
    misses: number;

    /**
     * Cache hit rate (0-1)
     */
    hitRate: number;

    /**
     * Number of evictions due to size/memory limits
     */
    evictions: number;

    /**
     * Number of entries that expired
     */
    expirations: number;

    /**
     * Current cache size
     */
    size: number;

    /**
     * Maximum cache size
     */
    maxSize: number | undefined;

    /**
     * Current memory usage in bytes (if memory tracking enabled)
     */
    memoryUsage?: number;

    /**
     * Maximum memory in bytes (if memory tracking enabled)
     */
    maxMemory?: number;
}

/**
 * Serialized cache data for export/import
 */
export interface SerializedCache<K, V> {
    maxSize?: number;
    maxMemoryBytes?: number;
    ttl: number | null;
    slidingTTL: boolean;
    maxTTL: number | null;
    entries: Array<{
        key: K;
        value: V;
        expiry: number;
        createdAt: number;
        size?: number;
    }>;
    keyOrder: K[];
    stats?: CacheStats;
}

/**
 * Cache event types
 */
export type CacheEventType = 'set' | 'delete' | 'clear' | 'evict' | 'expire';

/**
 * Cache event callback
 */
export type CacheEventCallback<K, V> = {
    set: (key: K, value: V, isUpdate: boolean) => void;
    delete: (key: K, value: V) => void;
    clear: () => void;
    evict: (key: K, value: V, reason: 'size' | 'memory') => void;
    expire: (key: K, value: V) => void;
};