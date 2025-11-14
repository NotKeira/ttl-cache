import {LRUCache} from '../src';

describe('Optimized LRU Cache', () => {
    describe('Doubly Linked List Performance', () => {
        it('should handle large cache efficiently with O(1) operations', () => {
            const cache = new LRUCache<number, string>({
                maxSize: 10000,
            });

            const start = performance.now();

            // Set 10,000 items
            for (let i = 0; i < 10000; i++) {
                cache.set(i, `value-${i}`);
            }

            // Access items randomly (should be O(1))
            for (let i = 0; i < 1000; i++) {
                const key = Math.floor(Math.random() * 10000);
                cache.get(key);
            }

            // Delete items randomly
            for (let i = 0; i < 100; i++) {
                const key = Math.floor(Math.random() * 10000);
                cache.delete(key);
            }

            const end = performance.now();

            expect(end - start).toBeLessThan(100); // Should be very fast
            expect(cache.size).toBeLessThan(10000);
        });

        it('should maintain LRU order correctly', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            // Access 'a' to move it to end
            cache.get('a');

            // Add new item, should evict 'b' (least recently used)
            cache.set('d', 4);

            expect(cache.has('a')).toBe(true);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });
    });

    describe('Sliding TTL', () => {
        it('should reset TTL on access when sliding TTL is enabled', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 100,
                slidingTTL: true,
            });

            cache.set('key', 123);

            setTimeout(() => {
                // Access the key after 60ms
                expect(cache.get('key')).toBe(123);

                // Should still be valid after another 60ms (total 120ms)
                // because sliding TTL reset it
                setTimeout(() => {
                    expect(cache.get('key')).toBe(123);
                    done();
                }, 60);
            }, 60);
        });

        it('should not reset TTL on access when sliding TTL is disabled', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 100,
                slidingTTL: false,
            });

            cache.set('key', 123);

            setTimeout(() => {
                // Access the key after 60ms
                expect(cache.get('key')).toBe(123);

                // Should expire after another 60ms (total 120ms)
                setTimeout(() => {
                    expect(cache.get('key')).toBeUndefined();
                    done();
                }, 60);
            }, 60);
        });
    });

    describe('Max TTL', () => {
        it('should enforce absolute maximum lifetime', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 1000,
                slidingTTL: true,
                maxTTL: 150,
            });

            cache.set('key', 123);

            // Keep accessing to slide TTL
            const interval = setInterval(() => {
                cache.get('key');
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                // Should be expired despite sliding TTL
                expect(cache.get('key')).toBeUndefined();
                done();
            }, 200);
        });
    });

    describe('Custom TTL per Entry', () => {
        it('should allow different TTLs for different entries', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 1000,
            });

            cache.set('key1', 1); // Uses default 1000ms
            cache.setWithTTL('key2', 2, 50); // Custom 50ms

            setTimeout(() => {
                expect(cache.get('key1')).toBe(1);
                expect(cache.get('key2')).toBeUndefined();
                done();
            }, 70);
        });
    });

    describe('TTL Management', () => {
        it('should get remaining TTL', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 1000,
            });

            cache.set('key', 123);
            const ttl = cache.getTTL('key');

            expect(ttl).toBeGreaterThan(900);
            expect(ttl).toBeLessThanOrEqual(1000);
        });

        it('should return null for non-existent keys', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            expect(cache.getTTL('nonexistent')).toBeNull();
        });

        it('should update TTL with touch', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 100,
            });

            cache.set('key', 123);

            setTimeout(() => {
                cache.touch('key', 200); // Extend by 200ms

                setTimeout(() => {
                    expect(cache.get('key')).toBe(123);
                    done();
                }, 150);
            }, 80);
        });
    });

    describe('Peek Operations', () => {
        it('should peek without updating LRU order', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            // Peek at 'a' (shouldn't move to end)
            expect(cache.peek('a')).toBe(1);

            // Add new item, should evict 'a'
            cache.set('d', 4);

            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(true);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });

        it('should peek multiple entries', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            const results = cache.peekMany(['a', 'b', 'd']);

            expect(results.get('a')).toBe(1);
            expect(results.get('b')).toBe(2);
            expect(results.has('d')).toBe(false);
        });
    });

    describe('Bulk Operations', () => {
        it('should set multiple entries', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.setMany([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            expect(cache.get('a')).toBe(1);
            expect(cache.get('b')).toBe(2);
            expect(cache.get('c')).toBe(3);
        });

        it('should get multiple entries', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            const results = cache.getMany(['a', 'b', 'd']);

            expect(results.get('a')).toBe(1);
            expect(results.get('b')).toBe(2);
            expect(results.has('d')).toBe(false);
            expect(results.size).toBe(2);
        });

        it('should delete multiple entries', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            const deleted = cache.deleteMany(['a', 'b', 'd']);

            expect(deleted).toBe(2);
            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
        });

        it('should check multiple entries', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('a', 1);
            cache.set('b', 2);

            const results = cache.hasMany(['a', 'b', 'c']);

            expect(results.get('a')).toBe(true);
            expect(results.get('b')).toBe(true);
            expect(results.get('c')).toBe(false);
        });
    });

    describe('Pattern Operations', () => {
        it('should delete entries by pattern', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('user:1', 1);
            cache.set('user:2', 2);
            cache.set('post:1', 3);
            cache.set('post:2', 4);

            const deleted = cache.deleteByPattern(/^user:/);

            expect(deleted).toBe(2);
            expect(cache.has('user:1')).toBe(false);
            expect(cache.has('user:2')).toBe(false);
            expect(cache.has('post:1')).toBe(true);
            expect(cache.has('post:2')).toBe(true);
        });

        it('should filter entries', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4);

            cache.filter((key, value) => value % 2 === 0);

            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(true);
            expect(cache.has('c')).toBe(false);
            expect(cache.has('d')).toBe(true);
            expect(cache.size).toBe(2);
        });
    });

    describe('Get or Compute', () => {
        it('should compute value if not cached', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            let computeCount = 0;
            const result = cache.getOrCompute('key', () => {
                computeCount++;
                return 42;
            });

            expect(result).toBe(42);
            expect(computeCount).toBe(1);
            expect(cache.get('key')).toBe(42);
        });

        it('should not compute if already cached', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('key', 100);

            let computeCount = 0;
            const result = cache.getOrCompute('key', () => {
                computeCount++;
                return 42;
            });

            expect(result).toBe(100);
            expect(computeCount).toBe(0);
        });

        it('should handle async compute functions', async () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            const result = await cache.getOrCompute('key', async () => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                return 42;
            });

            expect(result).toBe(42);
            expect(cache.get('key')).toBe(42);
        });
    });

    describe('Statistics', () => {
        it('should track hits and misses', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                enableStats: true,
            });

            cache.set('a', 1);
            cache.get('a'); // hit
            cache.get('b'); // miss
            cache.get('a'); // hit
            cache.get('c'); // miss

            const stats = cache.getStats();

            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(2);
            expect(stats.hitRate).toBe(0.5);
        });

        it('should track evictions', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
                enableStats: true,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4); // evicts 'a'
            cache.set('e', 5); // evicts 'b'

            const stats = cache.getStats();

            expect(stats.evictions).toBe(2);
        });

        it('should track expirations', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 50,
                enableStats: true,
            });

            cache.set('key', 1);

            setTimeout(() => {
                cache.get('key'); // expired, should count as miss + expiration

                const stats = cache.getStats();
                expect(stats.expirations).toBe(1);
                expect(stats.misses).toBe(1);
                done();
            }, 70);
        });

        it('should reset stats', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                enableStats: true,
            });

            cache.set('a', 1);
            cache.get('a');
            cache.get('b');

            cache.resetStats();

            const stats = cache.getStats();
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
        });
    });

    describe('Event Emitters', () => {
        it('should emit set events', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            const events: Array<{ key: string; value: number; isUpdate: boolean }> = [];

            cache.on('set', (key, value, isUpdate) => {
                events.push({key, value, isUpdate});
            });

            cache.set('a', 1);
            cache.set('a', 2);

            expect(events).toHaveLength(2);
            expect(events[0]).toEqual({key: 'a', value: 1, isUpdate: false});
            expect(events[1]).toEqual({key: 'a', value: 2, isUpdate: true});
        });

        it('should emit delete events', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            const events: Array<{ key: string; value: number }> = [];

            cache.on('delete', (key, value) => {
                events.push({key, value});
            });

            cache.set('a', 1);
            cache.delete('a');

            expect(events).toHaveLength(1);
            expect(events[0]).toEqual({key: 'a', value: 1});
        });

        it('should emit evict events', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 2,
            });

            const events: Array<{ key: string; value: number; reason: string }> = [];

            cache.on('evict', (key, value, reason) => {
                events.push({key, value, reason});
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3); // evicts 'a'

            expect(events).toHaveLength(1);
            expect(events[0]).toEqual({key: 'a', value: 1, reason: 'size'});
        });

        it('should emit expire events', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 50,
            });

            const events: Array<{ key: string; value: number }> = [];

            cache.on('expire', (key, value) => {
                events.push({key, value});
            });

            cache.set('a', 1);

            setTimeout(() => {
                cache.get('a'); // triggers expiration

                expect(events).toHaveLength(1);
                expect(events[0]).toEqual({key: 'a', value: 1});
                done();
            }, 70);
        });

        it('should emit clear events', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            let cleared = false;

            cache.on('clear', () => {
                cleared = true;
            });

            cache.set('a', 1);
            cache.clear();

            expect(cleared).toBe(true);
        });

        it('should remove event listeners', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            let count = 0;
            const handler = () => {
                count++;
            };

            cache.on('set', handler);
            cache.set('a', 1);

            cache.off('set', handler);
            cache.set('b', 2);

            expect(count).toBe(1);
        });
    });

    describe('Serialization', () => {
        it('should serialize and deserialize cache', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 60000,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            const json = cache.toJSON();
            const restored = LRUCache.fromJSON(json);

            expect(restored.get('a')).toBe(1);
            expect(restored.get('b')).toBe(2);
            expect(restored.get('c')).toBe(3);
            expect(restored.size).toBe(3);
        });

        it('should not restore expired entries', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 50,
            });

            cache.set('a', 1);

            setTimeout(() => {
                const json = cache.toJSON();
                const restored = LRUCache.fromJSON(json);

                expect(restored.size).toBe(0);
                done();
            }, 70);
        });
    });

    describe('Memory-based Eviction', () => {
        it('should evict based on memory usage', () => {
            const cache = new LRUCache<string, string>({
                maxMemoryBytes: 1000,
            });

            // Each entry is roughly estimated
            cache.set('a', 'x'.repeat(100));
            cache.set('b', 'x'.repeat(100));
            cache.set('c', 'x'.repeat(100));
            cache.set('d', 'x'.repeat(100));
            cache.set('e', 'x'.repeat(100)); // Should evict 'a'

            expect(cache.has('a')).toBe(false);
            expect(cache.size).toBeLessThan(5);
        });
    });

    describe('Auto Cleanup', () => {
        it('should automatically cleanup expired entries', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 50,
                autoCleanup: true,
                cleanupInterval: 100,
            });

            cache.set('a', 1);
            cache.set('b', 2);

            setTimeout(() => {
                // Entries should have been cleaned up automatically
                expect(cache.size).toBe(0);
                cache.dispose();
                done();
            }, 150);
        });
    });

    describe('Disposal', () => {
        it('should cleanup resources on disposal', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 1000,
                autoCleanup: true,
            });

            cache.set('a', 1);
            cache.dispose();

            expect(cache.size).toBe(0);
        });
    });
});