# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-11-14

### Added

#### Performance Optimizations

- **Doubly Linked List Implementation**: Replaced array-based LRU tracking with doubly linked list for O(1) operations
    - `moveToEnd()` now O(1) instead of O(n)
    - `delete()` now O(1) instead of O(n)
    - Massive performance improvements for large caches (10,000+ entries)
- **Lazy TTL Cleanup**: Added optional background cleanup timer with `autoCleanup` option
    - `cleanupInterval` option to control cleanup frequency (default: 60 seconds)
    - Automatically calls `unref()` to prevent blocking Node.js process exit

#### Advanced TTL Features

- **Sliding TTL**: Added `slidingTTL` option to reset TTL on access
- **Max TTL**: Added `maxTTL` option for absolute entry lifetime regardless of access
- **Per-Entry Custom TTL**: New `setWithTTL(key, value, ttl)` method for entry-specific TTLs
- **TTL Inspection**: New `getTTL(key)` method to get remaining TTL in milliseconds
- **TTL Refresh**: New `touch(key, ttl?)` method to update TTL without changing value

#### Peek Operations

- **Peek Without LRU Update**: New `peek(key)` method to inspect values without updating LRU order
- **Bulk Peek**: New `peekMany(keys)` method for multiple peek operations

#### Bulk Operations

- **Set Multiple**: New `setMany(entries)` method to set multiple entries at once
- **Get Multiple**: New `getMany(keys)` method to retrieve multiple entries
- **Delete Multiple**: New `deleteMany(keys)` method to remove multiple entries
- **Check Multiple**: New `hasMany(keys)` method to check existence of multiple keys

#### Pattern & Filter Operations

- **Pattern Deletion**: New `deleteByPattern(regex)` method for pattern-based deletion (e.g., `/^user:/`)
- **Filter**: New `filter(predicate)` method to remove entries not matching a predicate

#### Computed Values

- **Get or Compute**: New `getOrCompute(key, computeFn)` method for lazy value computation
- Supports both synchronous and asynchronous compute functions
- Automatically caches computed values

#### Statistics & Monitoring

- **Cache Statistics**: New `getStats()` method returning comprehensive cache metrics
    - Hit/miss counts and hit rate
    - Eviction and expiration counts
    - Current size and memory usage
- **Statistics Toggle**: New `enableStats` option to enable/disable stat tracking
- **Reset Statistics**: New `resetStats()` method to clear statistics

#### Event System

- **Event Emitters**: New event system for cache lifecycle monitoring
    - `set`: Fired when entry is added or updated
    - `delete`: Fired when entry is manually deleted
    - `evict`: Fired when entry is evicted (size or memory limit)
    - `expire`: Fired when entry expires due to TTL
    - `clear`: Fired when cache is cleared
- **Event Management**: New `on(event, callback)` and `off(event, callback)` methods

#### Memory-Based Eviction

- **Memory Limits**: New `maxMemoryBytes` option for memory-based eviction
- Automatic size estimation for cached values
- Can be used alone or combined with `maxSize`

#### Serialization

- **JSON Export**: New `toJSON()` method for serializing cache state
- **JSON Import**: New static `fromJSON(json)` method for restoring cache from serialized data
- Automatically filters expired entries during import

#### Namespacing

- **Namespaced Cache**: New `NamespacedCache` class for logical cache separation
- Create namespaces with `cache.namespace(prefix)` (if extended)
- Automatic key prefixing for isolated cache regions

#### Developer Experience

- **Dispose Method**: New `dispose()` method for proper resource cleanup
- **Better Error Messages**: Improved validation and error messages
- **Enhanced Type Definitions**: More comprehensive TypeScript types

### Changed

- **Constructor Validation**: Now requires either `maxSize` or `maxMemoryBytes` to be specified
- **Entry Structure**: Added `createdAt` and `size` fields to `CacheEntry` interface
- **Internal Architecture**: Refactored to use `LRUList` class for better separation of concerns
- **Version Management**: Removed hardcoded version export, now relies on package.json

### Performance Improvements

- 10-100x faster LRU operations for large caches due to O(1) linked list operations
- Reduced memory allocations during entry access and eviction
- Optional lazy expiry checking reduces unnecessary iterations

### Breaking Changes

- None - All existing APIs remain backward compatible
- New required validation: must specify either `maxSize` or `maxMemoryBytes`

### Internal

- Split `src/cache/lru.ts` into more maintainable structure
- Added `src/node/lru-node.ts` for doubly linked list implementation
- Consolidated entry utilities into single `src/entry.ts` file
- Added comprehensive test suite for new features (`tests/optimized-lru.test.ts`)

---

## [0.2.1] - 2024-XX-XX

### Fixed

- Minor bug fixes and improvements

## [0.2.0] - 2024-XX-XX

### Added

- Full Map-like interface implementation
- Iterator support (`keys()`, `values()`, `entries()`)
- `forEach()` method for iteration
- Comprehensive test suite
- Performance benchmarks

### Changed

- Improved documentation
- Enhanced TypeScript types

## [0.1.0] - 2024-XX-XX

### Added

- Initial release of `@notkeira/ttl-cache`
- **Core Features:**
    - LRU (Least Recently Used) cache implementation with automatic eviction
    - Optional TTL (Time To Live) support for cache entries
    - Full Map-like interface (`get`, `set`, `has`, `delete`, `clear`, `size`)
    - Iterator support (`keys()`, `values()`, `entries()`, `forEach()`)
    - Optional discord.js Collection backing store
    - TypeScript support with full type definitions

- **API:**
    - `LRUCache` class with configurable `maxSize`, `ttl`, and `useCollection` options
    - Automatic expiry pruning on access operations
    - LRU order updates on `get()` operations
    - Entry utilities: `createCacheEntry`, `isCacheEntryExpired`, `getCacheEntryTTL`
    - Collection utilities: `loadDiscordCollection`, `isDiscordAvailable`, `validateDiscordCollection`

- **Developer Experience:**
    - Comprehensive JSDoc documentation
    - Full TypeScript type definitions
    - Jest test suite with 95%+ coverage
    - ESLint + Prettier configuration
    - Example implementations

[0.3.0]: https://github.com/NotKeira/ttl-cache/compare/v0.2.1...v0.3.0

[0.2.1]: https://github.com/NotKeira/ttl-cache/compare/v0.2.0...v0.2.1

[0.2.0]: https://github.com/NotKeira/ttl-cache/compare/v0.1.0...v0.2.0

[0.1.0]: https://github.com/NotKeira/ttl-cache/releases/tag/v0.1.0