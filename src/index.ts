/**
 * @notkeira/ttl-cache
 *
 * A lightweight LRU (Least Recently Used) cache implementation with optional
 * TTL (Time To Live) support and discord.js Collection compatibility.
 *
 * @module @notkeira/ttl-cache
 * @version 0.1.0
 * @licence MIT
 * @author Keira Hopkins
 *
 * @example
 * ```typescript
 * import { LRUCache } from '@notkeira/ttl-cache';
 *
 * const cache = new LRUCache<string, number>({
 *   maxSize: 100,
 *   ttl: 60000, // 1 minute
 * });
 *
 * cache.set('key', 123);
 * const value = cache.get('key'); // 123
 * ```
 */

// Core cache implementation
export {LRUCache} from './cache';

// Type definitions
export type {CacheEntry, LRUCacheOptions} from './types';

// Entry utilities
export {
    createCacheEntry,
    isCacheEntryExpired,
    getCacheEntryTTL,
} from './entry';

// Collection utilities
export {
    loadDiscordCollection,
    isDiscordAvailable,
    validateDiscordCollection,
} from './utils';

/**
 * Current version of the ttl-cache package
 */
export const version = '0.1.0';