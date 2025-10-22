import { LRUCache } from '../src';

describe('Performance Benchmarks', () => {
    it('should handle 10,000 sequential writes efficiently', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 10000,
        });

        const start = performance.now();
        for (let i = 0; i < 10000; i++) {
            cache.set(i, `value-${i}`);
        }
        const end = performance.now();

        expect(cache.size).toBe(10000);
        expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle 10,000 sequential reads efficiently', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 10000,
        });

        // Populate cache
        for (let i = 0; i < 10000; i++) {
            cache.set(i, `value-${i}`);
        }

        const start = performance.now();
        for (let i = 0; i < 10000; i++) {
            cache.get(i);
        }
        const end = performance.now();

        expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle mixed operations efficiently', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 5000,
        });

        const start = performance.now();
        for (let i = 0; i < 10000; i++) {
            if (i % 3 === 0) {
                cache.set(i, `value-${i}`);
            } else if (i % 3 === 1) {
                cache.get(i % 5000);
            } else {
                cache.has(i % 5000);
            }
        }
        const end = performance.now();

        expect(end - start).toBeLessThan(150); // Should complete in under 150ms
    });

    it('should handle LRU eviction at scale efficiently', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 1000,
        });

        const start = performance.now();
        // Write 10,000 items to a cache that holds 1,000
        for (let i = 0; i < 10000; i++) {
            cache.set(i, `value-${i}`);
        }
        const end = performance.now();

        expect(cache.size).toBe(1000);
        expect(end - start).toBeLessThan(200); // Should handle evictions efficiently
    });

    it('should handle TTL expiry checks at scale', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 10000,
            ttl: 1000, // 1 second
        });

        // Populate cache
        for (let i = 0; i < 10000; i++) {
            cache.set(i, `value-${i}`);
        }

        const start = performance.now();
        // Access all entries (triggers expiry check for each)
        for (let i = 0; i < 10000; i++) {
            cache.has(i);
        }
        const end = performance.now();

        expect(end - start).toBeLessThan(100);
    });

    it('should handle rapid set/get cycles', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 100,
        });

        const start = performance.now();
        for (let cycle = 0; cycle < 1000; cycle++) {
            for (let i = 0; i < 10; i++) {
                cache.set(`key-${i}`, cycle);
                cache.get(`key-${i}`);
            }
        }
        const end = performance.now();

        expect(end - start).toBeLessThan(100);
    });
});

describe('Large Dataset Operations', () => {
    it('should handle 100,000 unique entries with eviction', () => {
        const cache = new LRUCache<number, { data: string }>({
            maxSize: 10000,
        });

        for (let i = 0; i < 100000; i++) {
            cache.set(i, { data: `large-value-${i}`.repeat(10) });
        }

        expect(cache.size).toBe(10000);
        // Only last 10,000 should remain
        expect(cache.has(99999)).toBe(true);
        expect(cache.has(0)).toBe(false);
    });

    it('should maintain LRU order with large dataset', () => {
        const cache = new LRUCache<number, number>({
            maxSize: 1000,
        });

        // Fill cache
        for (let i = 0; i < 1000; i++) {
            cache.set(i, i);
        }

        // Access first 500 entries to make them recently used
        for (let i = 0; i < 500; i++) {
            cache.get(i);
        }

        // Add 500 more entries (should evict 500-999, not 0-499)
        for (let i = 1000; i < 1500; i++) {
            cache.set(i, i);
        }

        expect(cache.size).toBe(1000);
        // First 500 should still exist (recently accessed)
        expect(cache.has(0)).toBe(true);
        expect(cache.has(499)).toBe(true);
        // Middle 500 should be evicted (least recently used)
        expect(cache.has(500)).toBe(false);
        expect(cache.has(999)).toBe(false);
        // New 500 should exist
        expect(cache.has(1000)).toBe(true);
        expect(cache.has(1499)).toBe(true);
    });

    it('should iterate over large dataset efficiently', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 50000,
        });

        for (let i = 0; i < 50000; i++) {
            cache.set(i, `value-${i}`);
        }

        const start = performance.now();
        let count = 0;
        for (const [key, value] of cache.entries()) {
            count++;
            expect(value).toBe(`value-${key}`);
        }
        const end = performance.now();

        expect(count).toBe(50000);
        expect(end - start).toBeLessThan(500);
    });

    it('should handle forEach on large dataset', () => {
        const cache = new LRUCache<number, number>({
            maxSize: 25000,
        });

        for (let i = 0; i < 25000; i++) {
            cache.set(i, i * 2);
        }

        const start = performance.now();
        let sum = 0;
        cache.forEach((value) => {
            sum += value;
        });
        const end = performance.now();

        // Sum should be 2 * (0 + 1 + 2 + ... + 24999)
        const expectedSum = 2 * ((24999 * 25000) / 2);
        expect(sum).toBe(expectedSum);
        expect(end - start).toBeLessThan(300);
    });

    it('should handle clear on large dataset', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 50000,
        });

        for (let i = 0; i < 50000; i++) {
            cache.set(i, `value-${i}`);
        }

        const start = performance.now();
        cache.clear();
        const end = performance.now();

        expect(cache.size).toBe(0);
        expect(end - start).toBeLessThan(50);
    });
});

describe('Concurrent-like Operations', () => {
    it('should handle rapid sequential writes to same keys', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        // Simulate concurrent updates to same keys
        for (let iteration = 0; iteration < 1000; iteration++) {
            for (let key = 0; key < 10; key++) {
                cache.set(`key-${key}`, iteration);
            }
        }

        // All keys should have final iteration value
        for (let key = 0; key < 10; key++) {
            expect(cache.get(`key-${key}`)).toBe(999);
        }
    });

    it('should maintain consistency during interleaved operations', () => {
        const cache = new LRUCache<number, number>({
            maxSize: 100,
        });

        // Interleave writes, reads, and deletes
        for (let i = 0; i < 1000; i++) {
            const key = i % 100;

            if (i % 5 === 0) {
                cache.set(key, i);
            } else if (i % 5 === 1) {
                cache.get(key);
            } else if (i % 5 === 2) {
                cache.has(key);
            } else if (i % 5 === 3) {
                cache.delete(key);
            } else {
                cache.set(key, i);
            }
        }

        // Cache should still be in valid state
        expect(cache.size).toBeLessThanOrEqual(100);
        expect(cache.size).toBeGreaterThanOrEqual(0);
    });

    it('should handle alternating set and delete operations', () => {
        const cache = new LRUCache<number, string>({
            maxSize: 50,
        });

        for (let round = 0; round < 100; round++) {
            // Set 50 items
            for (let i = 0; i < 50; i++) {
                cache.set(i, `round-${round}-value-${i}`);
            }

            expect(cache.size).toBe(50);

            // Delete 25 items
            for (let i = 0; i < 25; i++) {
                cache.delete(i);
            }

            expect(cache.size).toBe(25);
        }
    });

    it('should handle mixed TTL and non-TTL operations', () => {
        const shortTTLCache = new LRUCache<string, number>({
            maxSize: 100,
            ttl: 50, // 50ms
        });

        const noTTLCache = new LRUCache<string, number>({
            maxSize: 100,
        });

        // Populate both caches
        for (let i = 0; i < 100; i++) {
            shortTTLCache.set(`key-${i}`, i);
            noTTLCache.set(`key-${i}`, i);
        }

        expect(shortTTLCache.size).toBe(100);
        expect(noTTLCache.size).toBe(100);

        // Perform rapid mixed operations
        for (let i = 0; i < 50; i++) {
            shortTTLCache.get(`key-${i}`);
            noTTLCache.get(`key-${i}`);
            shortTTLCache.set(`new-${i}`, i);
            noTTLCache.set(`new-${i}`, i);
        }

        expect(noTTLCache.size).toBe(100); // Should remain at max
    });

    it('should handle stress test with random operations', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 500,
        });

        const operations = ['set', 'get', 'has', 'delete'];

        for (let i = 0; i < 10000; i++) {
            const op = operations[i % 4];
            const key = `key-${i % 1000}`;

            switch (op) {
                case 'set':
                    cache.set(key, i);
                    break;
                case 'get':
                    cache.get(key);
                    break;
                case 'has':
                    cache.has(key);
                    break;
                case 'delete':
                    cache.delete(key);
                    break;
            }
        }

        // Cache should be in valid state
        expect(cache.size).toBeLessThanOrEqual(500);
        expect(cache.size).toBeGreaterThanOrEqual(0);
    });
});
