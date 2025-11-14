# Enhanced LRU Cache CLI Example

Interactive CLI demonstrating advanced `@notkeira/ttl-cache` features.

## Features

- Max 10 cached items with LRU eviction
- 60 second sliding TTL (extends on access)
- Custom TTL per entry
- Peek without extending TTL
- Pattern-based deletion
- Real-time statistics
- Event monitoring

## Install
```bash
pnpm install
```

## Run
```bash
pnpm start
```

## Commands

Basic Operations

    set <key> <value> - Store a value with default TTL
    setttl <key> <value> <ms> - Store with custom TTL
    get <key> - Retrieve and extend TTL (sliding window)
    peek <key> - View without extending TTL
    has <key> - Check if key exists
    delete <key> - Remove a key

TTL Management

    ttl <key> - Get remaining TTL in seconds
    touch <key> [ms] - Extend TTL for a key

Bulk Operations

    pattern <regex> - Delete entries by regex pattern
    clear - Remove all items

Monitoring

    list - Show all cached items with TTL
    stats - Show cache statistics (hits, misses, hit rate)

Other

    help - Show all commands
    exit - Exit the CLI

## Example Session
```
> set user:alice Alice Smith
✅ Set 'user:alice' = 'Alice Smith'

> set user:bob Bob Jones
✅ Set 'user:bob' = 'Bob Jones'

> setttl temp:data Some temporary data 5000
✅ Set 'temp:data' = 'Some temporary data' (TTL: 5000ms)

> get user:alice
✅ 'user:alice' = 'Alice Smith'
   TTL extended to 60s

> peek user:bob
👀 'user:bob' = 'Bob Jones' (no TTL extension)

> ttl temp:data
⏱️  'temp:data' expires in 3s

> list
📋 Cache contents (3 items):
  user:alice: Alice Smith [60s]
  user:bob: Bob Jones [58s]
  temp:data: Some temporary data [2s]

> stats
📊 Cache statistics:
  Size: 3 / 10
  Hits: 1
  Misses: 0
  Hit Rate: 100.0%
  Evictions: 0
  Expirations: 0
  Default TTL: 60 seconds (sliding)

> pattern ^user:
✅ Deleted 2 entries matching /^user:/

> exit
👋 Goodbye!
```

## Features Demonstrated

1. **Sliding TTL**: Accessing entries extends their lifetime
2. **Custom TTL**: Different entries can have different TTLs
3. **Peek Operations**: Inspect without affecting LRU/TTL
4. **Statistics**: Track cache performance
5. **Events**: Real-time notifications of cache operations
6. **Pattern Deletion**: Remove multiple entries by regex

### New API Cache Example

```typescript
import {LRUCache} from '@notkeira/ttl-cache';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Post {
    id: string;
    userId: string;
    title: string;
    body: string;
}

// Create separate caches for different data types
const userCache = new LRUCache<string, User>({
    maxSize: 1000,
    ttl: 300000, // 5 minutes
    slidingTTL: true,
    enableStats: true,
});

const postCache = new LRUCache<string, Post>({
    maxSize: 5000,
    ttl: 600000, // 10 minutes
    enableStats: true,
});

// Monitor cache performance
userCache.on('evict', (key, user, reason) => {
    console.log(`User ${user.name} evicted from cache (${reason})`);
});

postCache.on('expire', (key, post) => {
    console.log(`Post "${post.title}" expired from cache`);
});

// Mock API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch user with caching
async function fetchUser(userId: string): Promise<User> {
    return userCache.getOrCompute(userId, async () => {
        console.log(`🌐 Fetching user ${userId} from API...`);
        await delay(1000); // Simulate API call

        return {
            id: userId,
            name: `User ${userId}`,
            email: `user${userId}@example.com`,
        };
    });
}

// Fetch post with caching
async function fetchPost(postId: string): Promise<Post> {
    return postCache.getOrCompute(postId, async () => {
        console.log(`🌐 Fetching post ${postId} from API...`);
        await delay(1000); // Simulate API call

        return {
            id: postId,
            userId: '1',
            title: `Post ${postId}`,
            body: `This is the body of post ${postId}`,
        };
    });
}

// Fetch multiple users efficiently
async function fetchUsers(userIds: string[]): Promise<Map<string, User>> {
    // Check cache first
    const cached = userCache.getMany(userIds);
    const missingIds = userIds.filter((id) => !cached.has(id));

    // Fetch missing users
    if (missingIds.length > 0) {
        console.log(`🌐 Fetching ${missingIds.length} users from API...`);
        await delay(1000);

        const users = missingIds.map(
            (id) =>
                ({
                    id,
                    name: `User ${id}`,
                    email: `user${id}@example.com`,
                }) as User
        );

        // Cache the new users
        userCache.setMany(users.map((u) => [u.id, u]));

        // Add to results
        users.forEach((u) => cached.set(u.id, u));
    }

    return cached;
}

// Invalidate user cache
function invalidateUser(userId: string) {
    userCache.delete(userId);
    console.log(`🗑️  Invalidated cache for user ${userId}`);
}

// Invalidate all user caches
function invalidateAllUsers() {
    userCache.deleteByPattern(/^/);
    console.log('🗑️  Invalidated all user caches');
}

// Print cache statistics
function printStats() {
    console.log('\n📊 Cache Statistics:');

    const userStats = userCache.getStats();
    console.log('\nUser Cache:');
    console.log(`  Size: ${userStats.size}/${userStats.maxSize}`);
    console.log(`  Hit Rate: ${(userStats.hitRate * 100).toFixed(1)}%`);
    console.log(`  Hits: ${userStats.hits}, Misses: ${userStats.misses}`);

    const postStats = postCache.getStats();
    console.log('\nPost Cache:');
    console.log(`  Size: ${postStats.size}/${postStats.maxSize}`);
    console.log(`  Hit Rate: ${(postStats.hitRate * 100).toFixed(1)}%`);
    console.log(`  Hits: ${postStats.hits}, Misses: ${postStats.misses}`);
    console.log();
}

// Demo
async function demo() {
    console.log('🚀 API Cache Demo\n');

    // First fetch (cache miss)
    console.log('--- First Fetch ---');
    await fetchUser('1');

    // Second fetch (cache hit)
    console.log('\n--- Second Fetch (should be cached) ---');
    await fetchUser('1');

    // Bulk fetch
    console.log('\n--- Bulk Fetch ---');
    const users = await fetchUsers(['1', '2', '3', '4']);
    console.log(`✅ Fetched ${users.size} users`);

    // Fetch posts
    console.log('\n--- Fetch Posts ---');
    await fetchPost('101');
    await fetchPost('102');
    await fetchPost('101'); // Cache hit

    // Print stats
    printStats();

    // Invalidate
    console.log('--- Invalidation ---');
    invalidateUser('1');

    // Fetch again (cache miss after invalidation)
    console.log('\n--- Fetch After Invalidation ---');
    await fetchUser('1');

    // Final stats
    printStats();

    // Cleanup
    userCache.dispose();
    postCache.dispose();
}

demo().catch(console.error);
```
