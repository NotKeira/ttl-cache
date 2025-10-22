import type { CacheEntry } from '../types';

/**
 * Creates a new cache entry with the provided value and expiry time.
 *
 * @template V - The type of the cached value
 * @param value - The value to store in the cache
 * @param expiry - Unix timestamp (in milliseconds) when this entry expires
 * @returns A new CacheEntry object
 *
 * @example
 * ```typescript
 * const entry = createCacheEntry('myValue', Date.now() + 60000);
 * ```
 */
export function createCacheEntry<V>(value: V, expiry: number): CacheEntry<V> {
    return { value, expiry };
}

/**
 * Checks if a cache entry has expired based on the current time.
 *
 * @template V - The type of the cached value
 * @param entry - The cache entry to check
 * @returns True if the entry has expired, false otherwise
 *
 * @example
 * ```typescript
 * if (isCacheEntryExpired(entry)) {
 *   console.log('Entry has expired');
 * }
 * ```
 */
export function isCacheEntryExpired<V>(entry: CacheEntry<V>): boolean {
    return Date.now() > entry.expiry;
}

/**
 * Gets the remaining time in milliseconds until a cache entry expires.
 *
 * @template V - The type of the cached value
 * @param entry - The cache entry to check
 * @returns Milliseconds until expiry, or 0 if already expired
 *
 * @example
 * ```typescript
 * const ttl = getCacheEntryTTL(entry);
 * console.log(`Entry expires in ${ttl}ms`);
 * ```
 */
export function getCacheEntryTTL<V>(entry: CacheEntry<V>): number {
    const remaining = entry.expiry - Date.now();
    return Math.max(0, remaining);
}