import {LRUCache} from '../src';

describe('LRU Ordering', () => {
    describe('Basic LRU Behavior', () => {
        it('should evict least recently used item', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4); // Should evict 'a'

            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(true);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });

        it('should update LRU order on get', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            cache.get('a'); // Move 'a' to most recently used

            cache.set('d', 4); // Should evict 'b', not 'a'

            expect(cache.has('a')).toBe(true);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });

        it('should update LRU order on set of existing key', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            cache.set('a', 10); // Update and move to most recently used

            cache.set('d', 4); // Should evict 'b'

            expect(cache.has('a')).toBe(true);
            expect(cache.get('a')).toBe(10);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });
    });

    describe('Complex Access Patterns', () => {
        it('should maintain correct order with multiple accesses', () => {
            const cache = new LRUCache<number, string>({
                maxSize: 5,
            });

            // Fill cache: 1, 2, 3, 4, 5
            for (let i = 1; i <= 5; i++) {
                cache.set(i, `value-${i}`);
            }

            // Access pattern: 1, 3, 5
            cache.get(1);
            cache.get(3);
            cache.get(5);

            // Order should now be: 2, 4, 1, 3, 5
            // Adding 3 new items should evict 2, 4, and then 1

            cache.set(6, 'value-6'); // Evicts 2
            expect(cache.has(2)).toBe(false);
            expect(cache.has(1)).toBe(true);

            cache.set(7, 'value-7'); // Evicts 4
            expect(cache.has(4)).toBe(false);
            expect(cache.has(1)).toBe(true);

            cache.set(8, 'value-8'); // Evicts 1
            expect(cache.has(1)).toBe(false);
            expect(cache.has(3)).toBe(true);
            expect(cache.has(5)).toBe(true);
            expect(cache.has(6)).toBe(true);
            expect(cache.has(7)).toBe(true);
            expect(cache.has(8)).toBe(true);
        });

        it('should handle alternating access pattern', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 4,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4);

            // Alternate between first and last
            for (let i = 0; i < 10; i++) {
                if (i % 2 === 0) {
                    cache.get('a');
                } else {
                    cache.get('d');
                }
            }

            // 'a' and 'd' are most recently used
            cache.set('e', 5); // Should evict 'b'
            cache.set('f', 6); // Should evict 'c'

            expect(cache.has('a')).toBe(true);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(false);
            expect(cache.has('d')).toBe(true);
            expect(cache.has('e')).toBe(true);
            expect(cache.has('f')).toBe(true);
        });

        it('should handle round-robin access pattern', () => {
            const cache = new LRUCache<number, string>({
                maxSize: 5,
            });

            for (let i = 0; i < 5; i++) {
                cache.set(i, `value-${i}`);
            }

            // Access in round-robin: 0, 1, 2, 3, 4, 0, 1, 2, 3, 4
            for (let round = 0; round < 2; round++) {
                for (let i = 0; i < 5; i++) {
                    cache.get(i);
                }
            }

            // All items accessed recently, order should be: 0, 1, 2, 3, 4
            cache.set(5, 'value-5'); // Should evict 0

            expect(cache.has(0)).toBe(false);
            for (let i = 1; i <= 5; i++) {
                expect(cache.has(i)).toBe(true);
            }
        });
    });

    describe('LRU with Updates', () => {
        it('should not evict frequently updated items', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('frequent', 1);
            cache.set('rare1', 2);
            cache.set('rare2', 3);

            // Frequently update one key
            for (let i = 0; i < 10; i++) {
                cache.set('frequent', i);
            }

            // Add new items
            cache.set('new1', 100);
            cache.set('new2', 200);

            // 'frequent' should still exist
            expect(cache.has('frequent')).toBe(true);
            expect(cache.has('rare1')).toBe(false);
            expect(cache.has('rare2')).toBe(false);
            expect(cache.has('new1')).toBe(true);
            expect(cache.has('new2')).toBe(true);
        });

        it('should handle mixed gets and sets maintaining order', () => {
            const cache = new LRUCache<number, number>({
                maxSize: 4,
            });

            cache.set(1, 10);
            cache.set(2, 20);
            cache.get(1); // Access 1
            cache.set(3, 30);
            cache.get(2); // Access 2
            cache.set(4, 40);
            cache.set(1, 15); // Update 1

            // Order: 3, 4, 2, 1
            cache.set(5, 50); // Should evict 3

            expect(cache.has(1)).toBe(true);
            expect(cache.has(2)).toBe(true);
            expect(cache.has(3)).toBe(false);
            expect(cache.has(4)).toBe(true);
            expect(cache.has(5)).toBe(true);
        });
    });

    describe('LRU Order Verification', () => {
        it('should maintain strict FIFO order when no access occurs', () => {
            const cache = new LRUCache<number, number>({
                maxSize: 5,
            });

            for (let i = 0; i < 10; i++) {
                cache.set(i, i * 10);
            }

            // First 5 should be evicted, last 5 should remain
            for (let i = 0; i < 5; i++) {
                expect(cache.has(i)).toBe(false);
            }
            for (let i = 5; i < 10; i++) {
                expect(cache.has(i)).toBe(true);
            }
        });

        it('should verify order through sequential evictions', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            const evictionOrder: string[] = [];

            cache.set('first', 1);
            cache.set('second', 2);
            cache.set('third', 3);

            cache.set('fourth', 4);
            if (!cache.has('first')) evictionOrder.push('first');

            cache.set('fifth', 5);
            if (!cache.has('second')) evictionOrder.push('second');

            cache.set('sixth', 6);
            if (!cache.has('third')) evictionOrder.push('third');

            expect(evictionOrder).toEqual(['first', 'second', 'third']);
        });

        it('should handle repeated access to same key', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            // Access 'a' multiple times
            for (let i = 0; i < 5; i++) {
                cache.get('a');
            }

            cache.set('d', 4); // Should evict 'b'

            expect(cache.has('a')).toBe(true);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
        });
    });

    describe('LRU with Deletions', () => {
        it('should not affect LRU order when deleting non-existent key', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            cache.delete('nonexistent');

            cache.set('d', 4); // Should still evict 'a'

            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(true);
        });

        it('should remove deleted items from LRU order', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 4,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4);

            cache.delete('b'); // Remove 'b' from LRU order, size now 3

            cache.set('e', 5); // Size becomes 4, no eviction
            cache.set('f', 6); // Now at capacity, should evict 'a'

            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
            expect(cache.has('e')).toBe(true);
            expect(cache.has('f')).toBe(true);
            expect(cache.size).toBe(4);
        });

        it('should handle deleting least recently used item', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 3,
            });

            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            cache.delete('a'); // Delete LRU item, sie now 2

            cache.set('d', 4); // Size becomes 3, no eviction
            cache.set('e', 5); // now at capacity, should evict 'b'

            expect(cache.has('a')).toBe(false);
            expect(cache.has('b')).toBe(false);
            expect(cache.has('c')).toBe(true);
            expect(cache.has('d')).toBe(true);
            expect(cache.has('e')).toBe(true);
            expect(cache.size).toBe(3);
        });
    });

    describe('LRU Corner Cases', () => {
        it('should handle all items being accessed before eviction', () => {
            const cache = new LRUCache<number, number>({
                maxSize: 5,
            });

            for (let i = 0; i < 5; i++) {
                cache.set(i, i);
            }

            // Access all in order
            for (let i = 0; i < 5; i++) {
                cache.get(i);
            }

            cache.set(5, 5); // Should evict 0 (first accessed)

            expect(cache.has(0)).toBe(false);
            for (let i = 1; i <= 5; i++) {
                expect(cache.has(i)).toBe(true);
            }
        });

        it('should handle rapid eviction cycles', () => {
            const cache = new LRUCache<number, number>({
                maxSize: 2,
            });

            for (let i = 0; i < 100; i++) {
                cache.set(i, i);
                // Only last 2 should exist
                expect(cache.size).toBe(Math.min(i + 1, 2));
            }

            expect(cache.has(98)).toBe(true);
            expect(cache.has(99)).toBe(true);
            expect(cache.has(97)).toBe(false);
        });
    });
});
