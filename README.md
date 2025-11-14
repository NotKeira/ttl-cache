# @notkeira/ttl-cache

[![npm version](https://badge.fury.io/js/%40notkeira%2Fttl-cache.svg)](https://www.npmjs.com/package/@notkeira/ttl-cache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, feature-rich LRU (Least Recently Used) cache implementation with optional TTL (Time To Live) support and discord.js Collection compatibility.

## ✨ Features

### Core Features
- 🚀 **High Performance**: O(1) operations using doubly linked list
- ⏱️ **Flexible TTL**: Global, per-entry, sliding, and max TTL support
- 💾 **Memory Management**: Size-based and memory-based eviction strategies
- 📊 **Statistics**: Built-in cache hit/miss tracking and monitoring
- 🎯 **Event System**: Comprehensive event emitters for cache lifecycle
- 🔍 **Peek Operations**: Inspect cache without affecting LRU order
- 📦 **Bulk Operations**: Efficient batch get/set/delete operations
- 🏷️ **Pattern Matching**: Delete entries by regex patterns
- 🔄 **Serialization**: Export/import cache state to/from JSON
- 🎭 **Namespacing**: Logical cache separation with prefixes
- 🎮 **Discord.js Support**: Optional Collection backing store
- 📘 **TypeScript**: Full type definitions included

### Performance
- **10-100x faster** than array-based LRU for large caches
- O(1) get, set, and delete operations
- Minimal memory allocations
- Optional lazy expiry checking

## 📦 Installation

```bash
npm install @notkeira/ttl-cache
```

```bash
pnpm add @notkeira/ttl-cache
```

```bash
yarn add @notkeira/ttl-cache
```

## 🚀 Quick Start

### Basic Usage

```typescript
import {LRUCache} from '@notkeira/ttl-cache';

const cache = new LRUCache<string, number>({
    maxSize: 100,
    ttl: 60000, // 1 minute
});

cache.set('key', 123);
const value = cache.get('key'); // 123

// After TTL expires
setTimeout(() => {
    cache.get('key'); // undefined
}, 61000);
```

### With Statistics

```typescript
const cache = new LRUCache<string, User>({
    maxSize: 500,
    ttl: 300000, // 5 minutes
    enableStats: true,
});

cache.set('user:123', userData);

// Check performance
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate * 100}%`);
console.log(`Size: ${stats.size}/${stats.maxSize}`);
```

### Sliding TTL

```typescript
const cache = new LRUCache<string, Session>({
    maxSize: 1000,
    ttl: 1800000, // 30 minutes
    slidingTTL: true, // Reset TTL on access
    maxTTL: 86400000, // 24 hour absolute max
});

cache.set('session:abc', sessionData);
cache.get('session:abc'); // Resets TTL to 30 minutes
```

### Memory-Based Eviction

```typescript
const cache = new LRUCache<string, Buffer>({
    maxMemoryBytes: 100 * 1024 * 1024, // 100 MB
    ttl: 3600000, // 1 hour
});

cache.set('large-file', buffer);
```

### Event Monitoring

```typescript
const cache = new LRUCache<string, any>({
    maxSize: 100,
    enableStats: true,
});

cache.on('evict', (key, value, reason) => {
    console.log(`Evicted ${key} due to ${reason}`);
});

cache.on('expire', (key, value) => {
    console.log(`Expired ${key}`);
});

cache.on('set', (key, value, isUpdate) => {
    console.log(`Set ${key} (update: ${isUpdate})`);
});
```

## 📖 API Reference

### Constructor Options

```typescript
interface LRUCacheOptions {
    maxSize?: number;              // Max number of entries
    maxMemoryBytes?: number;       // Max memory usage in bytes
    ttl?: number;                  // Default TTL in milliseconds
    slidingTTL?: boolean;          // Reset TTL on access
    maxTTL?: number;               // Absolute max lifetime
    useCollection?: boolean;       // Use discord.js Collection
    autoCleanup?: boolean;         // Enable background cleanup
    cleanupInterval?: number;      // Cleanup interval (ms)
    enableStats?: boolean;         // Enable statistics tracking
}
```

### Core Methods

#### Basic Operations
- `set(key: K, value: V): void` - Add or update entry
- `setWithTTL(key: K, value: V, ttl: number): void` - Set with custom TTL
- `get(key: K): V | undefined` - Retrieve entry (updates LRU)
- `peek(key: K): V | undefined` - Retrieve without updating LRU
- `has(key: K): boolean` - Check if key exists
- `delete(key: K): boolean` - Remove entry
- `clear(): void` - Remove all entries
- `size: number` - Current cache size

#### TTL Management
- `getTTL(key: K): number | null` - Get remaining TTL
- `touch(key: K, ttl?: number): boolean` - Update TTL without changing value

#### Computed Values
- `getOrCompute(key: K, computeFn: () => V | Promise<V>): V | Promise<V>` - Get or compute value

#### Bulk Operations
- `setMany(entries: Array<[K, V]>): void` - Set multiple entries
- `getMany(keys: K[]): Map<K, V>` - Get multiple entries
- `peekMany(keys: K[]): Map<K, V>` - Peek multiple entries
- `deleteMany(keys: K[]): number` - Delete multiple entries
- `hasMany(keys: K[]): Map<K, boolean>` - Check multiple entries

#### Pattern & Filter Operations
- `deleteByPattern(pattern: RegExp): number` - Delete by regex pattern
- `filter(predicate: (key: K, value: V) => boolean): void` - Filter entries

#### Iteration
- `keys(): IterableIterator<K>` - Iterate over keys
- `values(): IterableIterator<V>` - Iterate over values
- `entries(): IterableIterator<[K, V]>` - Iterate over entries
- `forEach(callback: (value: V, key: K, map: this) => void): void` - Execute function for each entry

#### Statistics
- `getStats(): CacheStats` - Get cache statistics
- `resetStats(): void` - Reset statistics

#### Events
- `on<E extends CacheEventType>(event: E, callback: CacheEventCallback<K, V>[E]): void` - Register event listener
- `off<E extends CacheEventType>(event: E, callback: CacheEventCallback<K, V>[E]): void` - Remove event listener

#### Serialization
- `toJSON(): SerializedCache<K, V>` - Serialize cache to JSON
- `static fromJSON<K, V>(json: SerializedCache<K, V>): LRUCache<K, V>` - Restore from JSON

#### Cleanup
- `dispose(): void` - Cleanup resources and stop timers

### Statistics Object

```typescript
interface CacheStats {
    hits: number;              // Number of cache hits
    misses: number;            // Number of cache misses
    hitRate: number;           // Hit rate (0-1)
    evictions: number;         // Number of evictions
    expirations: number;       // Number of expirations
    size: number;              // Current size
    maxSize: number;           // Maximum size
    memoryUsage?: number;      // Current memory usage (bytes)
    maxMemory?: number;        // Maximum memory (bytes)
}
```

### Event Types

```typescript
type CacheEventType = 'set' | 'delete' | 'clear' | 'evict' | 'expire';

interface CacheEventCallback<K, V> {
    set: (key: K, value: V, isUpdate: boolean) => void;
    delete: (key: K, value: V) => void;
    clear: () => void;
    evict: (key: K, value: V, reason: 'size' | 'memory') => void;
    expire: (key: K, value: V) => void;
}
```

## 💡 Examples

### API Response Caching

```typescript
import {LRUCache} from '@notkeira/ttl-cache';

const apiCache = new LRUCache<string, any>({
    maxSize: 1000,
    ttl: 300000, // 5 minutes
    slidingTTL: true,
    enableStats: true,
});

async function fetchUser(id: string) {
    return apiCache.getOrCompute(`user:${id}`, async () => {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    });
}

// Log stats periodically
setInterval(() => {
    const stats = apiCache.getStats();
    console.log(`API Cache - Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
}, 60000);
```

### Session Management

```typescript
interface Session {
    userId: string;
    data: any;
    createdAt: number;
}

const sessionCache = new LRUCache<string, Session>({
    maxSize: 10000,
    ttl: 1800000, // 30 minutes
    slidingTTL: true, // Extend on activity
    maxTTL: 86400000, // 24 hour absolute max
});

// Extend session on activity
sessionCache.on('set', (key, value, isUpdate) => {
    if (isUpdate) {
        console.log(`Session ${key} activity detected`);
    }
});

// Cleanup expired sessions
sessionCache.on('expire', (key, session) => {
    console.log(`Session ${session.userId} expired`);
});
```

### Multi-Tenant Cache

```typescript
const cache = new LRUCache<string, any>({
    maxSize: 10000,
    ttl: 600000,
});

class TenantCache {
    constructor(private tenantId: string) {}

    set(key: string, value: any) {
        cache.set(`${this.tenantId}:${key}`, value);
    }

    get(key: string) {
        return cache.get(`${this.tenantId}:${key}`);
    }

    clear() {
        cache.deleteByPattern(new RegExp(`^${this.tenantId}:`));
    }
}

const tenant1 = new TenantCache('tenant1');
const tenant2 = new TenantCache('tenant2');

tenant1.set('config', {theme: 'dark'});
tenant2.set('config', {theme: 'light'});
```

### Database Query Cache

```typescript
const queryCache = new LRUCache<string, any[]>({
    maxMemoryBytes: 512 * 1024 * 1024, // 512 MB
    ttl: 600000, // 10 minutes
    enableStats: true,
});

async function query(sql: string, params: any[]) {
    const cacheKey = `${sql}:${JSON.stringify(params)}`;
    
    return queryCache.getOrCompute(cacheKey, async () => {
        return await db.query(sql, params);
    });
}

// Monitor cache effectiveness
queryCache.on('evict', (key, value, reason) => {
    if (reason === 'memory') {
        console.warn('Query cache memory limit reached');
    }
});
```

### Image/Asset Cache

```typescript
const assetCache = new LRUCache<string, Buffer>({
    maxMemoryBytes: 1024 * 1024 * 1024, // 1 GB
    ttl: 3600000, // 1 hour
    autoCleanup: true,
    cleanupInterval: 300000, // 5 minutes
});

async function loadImage(url: string): Promise<Buffer> {
    return assetCache.getOrCompute(url, async () => {
        const response = await fetch(url);
        return Buffer.from(await response.arrayBuffer());
    });
}
```

## 🎮 Discord.js Integration

```typescript
import {LRUCache} from '@notkeira/ttl-cache';

const userCache = new LRUCache<string, User>({
    maxSize: 5000,
    ttl: 600000, // 10 minutes
    useCollection: true, // Requires discord.js
});

// Now backed by discord.js Collection
userCache.set('user:123', userData);
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run performance benchmarks
pnpm test tests/performance.test.ts
```

## 📊 Performance Benchmarks

```
Operations on 10,000 entries:
- Set: ~5ms
- Get (random): ~2ms
- Delete (random): ~3ms
- Iteration: ~8ms

Memory usage:
- Overhead per entry: ~200 bytes
- 10,000 entries: ~2MB + data size
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Keira Hopkins](https://github.com/NotKeira)

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/@notkeira/ttl-cache)
- [GitHub Repository](https://github.com/NotKeira/ttl-cache)
- [Issue Tracker](https://github.com/NotKeira/ttl-cache/issues)
- [Changelog](https://github.com/NotKeira/ttl-cache/blob/main/CHANGELOG.md)

## 🙏 Acknowledgments

- Inspired by various LRU cache implementations
- Built with TypeScript and modern JavaScript features
- Tested with Jest and optimized for Node.js and browser environments