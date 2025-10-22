/**
 * @notkeira/ttl-cache
 *
 * A lightweight LRU (Least Recently Used) cache implementation with optional
 * TTL (Time to Live) support and discord.js Collection compatability.
 *
 * @module @notkeira/ttl-cache
 * @version 0.1.0
 * @license MIT
 */

export { LRUCache } from './cache';
export type { CacheEntry, LRUCacheOptions } from './types';

/**
 * Current version of the ttl-cache package
 */
export const version = '0.1.0';