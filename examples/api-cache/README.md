# API Response Caching Example

Demonstrates using `@notkeira/ttl-cache` for efficient API response caching.

## Features

- Separate caches for different data types
- Automatic cache-aside pattern with `getOrCompute()`
- Bulk fetch optimization
- Cache invalidation strategies
- Sliding TTL for frequently accessed data
- Real-time statistics monitoring

## Run

```bash
pnpm install
pnpm start
```

## Output

```shell
🚀 API Cache Demo

--- First Fetch ---
🌐 Fetching user 1 from API...

--- Second Fetch (should be cached) ---

--- Bulk Fetch ---
🌐 Fetching 3 users from API...
✅ Fetched 4 users

--- Fetch Posts ---
🌐 Fetching post 101 from API...
🌐 Fetching post 102 from API...

📊 Cache Statistics:

User Cache:
  Size: 4/1000
  Hit Rate: 42.9%
  Hits: 3, Misses: 4

Post Cache:
  Size: 2/5000
  Hit Rate: 33.3%
  Hits: 1, Misses: 2
```

## Patterns Demonstrated
1. Cache-Aside: getOrCompute() automatically handles cache misses 
2. Sliding TTL: User cache extends TTL on access 
3. Bulk Operations: getMany() and setMany() for efficiency 
4. Cache Invalidation: Manual invalidation with delete() and patterns 
5. Statistics: Real-time monitoring of cache performance
