# @NotKeira/ttl-cache

![CI](https://github.com/NotKeira/ttl-cache/workflows/CI/badge.svg)

Lightweight LRU cache with TTL support and optional discord.js Collection compatibility.

## Installation

```bash
# Using PNPM
pnpm add @notkeira/ttl-cache

# Using NPM
npm install @notkeira/ttl-cache

# Using BUN
bun add @notkeira/ttl-cache

# Using Yarn
yarn add @notkeira/ttl-cache
```

## Features

- LRU (Least Recently Used) eviction policy
- Optional TTL (Time To Live) per entry
- Automatic expiry pruning on access
- Optional discord.js Collection backing
- Full Map-like interface
- Zero dependencies (discord.js optional)
- TypeScript support

## Usage

### Basic Usage

```typescript
import {LRUCache} from '@notkeira/ttl-cache';

const cache = new LRUCache<string, number>({
    maxSize: 100,
    ttl: 60000, // 1 minute (optional)
});

cache.set('key', 123);
const value = cache.get('key'); // 123

// After TTL expires
setTimeout(() => {
    cache.get('key'); // undefined
}, 61000);
```

### With discord.js Collection

```typescript
const cache = new LRUCache<string, User>({
    maxSize: 500,
    ttl: 300000, // 5 minutes
    useCollection: true, // Requires discord.js installed
});

cache.set('user:123', user);
```

### API

#### Constructor Options

- `maxSize: number` - Maximum number of entries before LRU eviction
- `ttl?: number` - Time to live in milliseconds (optional)
- `useCollection?: boolean` - Use discord.js Collection as backing store (optional)

#### Methods

- `set(key: K, value: V): void` - Add or update entry
- `get(key: K): V | undefined` - Retrieve entry (updates LRU order)
- `has(key: K): boolean` - Check if key exists and hasn't expired
- `delete(key: K): boolean` - Remove entry
- `clear(): void` - Remove all entries
- `size: number` - Current cache size (excludes expired entries)
- `keys(): IterableIterator<K>` - Iterate over keys
- `values(): IterableIterator<V>` - Iterate over values
- `entries(): IterableIterator<[K, V]>` - Iterate over entries
- `forEach(callback: (value: V, key: K, map: this) => void): void` - Execute function for each entry

## Licence

This project is licensed under the **MIT** License. Check [LICENSE](LICENSE) for more information.
