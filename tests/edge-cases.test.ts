import {LRUCache} from '../src';

describe('Edge Cases', () => {
    describe('Empty Cache', () => {
        it('should handle get on empty cache', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should handle has on empty cache', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            expect(cache.has('nonexistent')).toBe(false);
        });

        it('should handle delete on empty cache', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            expect(cache.delete('nonexistent')).toBe(false);
        });

        it('should handle clear on empty cache', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            expect(() => cache.clear()).not.toThrow();
            expect(cache.size).toBe(0);
        });

        it('should handle iteration on empty cache', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            expect(Array.from(cache.keys())).toEqual([]);
            expect(Array.from(cache.values())).toEqual([]);
            expect(Array.from(cache.entries())).toEqual([]);
        });

        it('should handle forEach on empty cache', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            const callback = jest.fn();
            cache.forEach(callback);

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Single Item Cache', () => {
        it('should handle cache with maxSize of 1', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 1,
            });

            cache.set('key1', 1);
            expect(cache.size).toBe(1);
            expect(cache.get('key1')).toBe(1);

            cache.set('key2', 2);
            expect(cache.size).toBe(1);
            expect(cache.has('key1')).toBe(false);
            expect(cache.get('key2')).toBe(2);
        });

        it('should handle repeated updates to single item', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 1,
            });

            for (let i = 0; i < 100; i++) {
                cache.set('key', i);
                expect(cache.get('key')).toBe(i);
                expect(cache.size).toBe(1);
            }
        });
    });

    describe('Exactly At MaxSize', () => {
        it('should maintain size exactly at maxSize', () => {
            const cache = new LRUCache<number, string>({
                maxSize: 100,
            });

            for (let i = 0; i < 100; i++) {
                cache.set(i, `value-${i}`);
            }

            expect(cache.size).toBe(100);

            // Add one more - should still be 100
            cache.set(100, 'value-100');
            expect(cache.size).toBe(100);
            expect(cache.has(0)).toBe(false);
            expect(cache.has(100)).toBe(true);
        });

        it('should handle updates at maxSize', () => {
            const cache = new LRUCache<number, string>({
                maxSize: 50,
            });

            for (let i = 0; i < 50; i++) {
                cache.set(i, `value-${i}`);
            }

            // Update existing keys shouldn't evict
            for (let i = 0; i < 50; i++) {
                cache.set(i, `updated-${i}`);
            }

            expect(cache.size).toBe(50);
            expect(cache.get(0)).toBe('updated-0');
        });
    });

    describe('TTL Edge Cases', () => {
        it('should handle Infinity TTL (no expiry)', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: Infinity,
            });

            cache.set('key', 123);
            expect(cache.get('key')).toBe(123);
            expect(cache.has('key')).toBe(true);
        });

        it('should handle zero TTL', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 0,
            });

            cache.set('key', 123);

            setTimeout(() => {
                expect(cache.get('key')).toBeUndefined();
                expect(cache.has('key')).toBe(false);
                done();
            }, 10);
        });

        it('should handle entry expiring exactly at TTL boundary', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 100,
            });

            cache.set('key', 123);

            setTimeout(() => {
                expect(cache.get('key')).toBeUndefined();
            }, 110);

            setTimeout(() => {
                done();
            }, 120);
        });

        it('should handle mixed expired and valid entries', (done) => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
                ttl: 100,
            });

            cache.set('expires', 1);

            setTimeout(() => {
                cache.set('valid', 2);

                setTimeout(() => {
                    expect(cache.has('expires')).toBe(false);
                    expect(cache.has('valid')).toBe(true);
                    expect(cache.size).toBe(1);
                    done();
                }, 60);
            }, 60);
        });

        it('should prune expired entries during iteration', (done) => {
            const cache = new LRUCache<number, string>({
                maxSize: 100,
                ttl: 50,
            });

            for (let i = 0; i < 10; i++) {
                cache.set(i, `value-${i}`);
            }

            setTimeout(() => {
                const entries = Array.from(cache.entries());
                expect(entries.length).toBe(0);
                expect(cache.size).toBe(0);
                done();
            }, 100);
        });
    });

    describe('Boundary Conditions', () => {
        it('should handle very large maxSize', () => {
            const cache = new LRUCache<number, number>({
                maxSize: Number.MAX_SAFE_INTEGER,
            });

            for (let i = 0; i < 1000; i++) {
                cache.set(i, i);
            }

            expect(cache.size).toBe(1000);
        });

        it('should handle null and undefined as values', () => {
            const cache = new LRUCache<string, null | undefined>({
                maxSize: 10,
            });

            cache.set('null', null);
            cache.set('undefined', undefined);

            expect(cache.get('null')).toBe(null);
            expect(cache.get('undefined')).toBe(undefined);
            expect(cache.has('null')).toBe(true);
            expect(cache.has('undefined')).toBe(true);
        });

        it('should handle complex objects as values', () => {
            const cache = new LRUCache<string, { nested: { data: number[] } }>({
                maxSize: 10,
            });

            const obj = {nested: {data: [1, 2, 3]}};
            cache.set('key', obj);

            expect(cache.get('key')).toEqual(obj);
            expect(cache.get('key')).toBe(obj); // Same reference
        });

        it('should handle objects as keys', () => {
            const cache = new LRUCache<{ id: number }, string>({
                maxSize: 10,
            });

            const key1 = {id: 1};
            const key2 = {id: 2};

            cache.set(key1, 'value1');
            cache.set(key2, 'value2');

            expect(cache.get(key1)).toBe('value1');
            expect(cache.get(key2)).toBe('value2');
            expect(cache.get({id: 1})).toBeUndefined(); // Different reference
        });

        it('should handle symbols as keys', () => {
            const cache = new LRUCache<symbol, string>({
                maxSize: 10,
            });

            const sym1 = Symbol('key1');
            const sym2 = Symbol('key2');

            cache.set(sym1, 'value1');
            cache.set(sym2, 'value2');

            expect(cache.get(sym1)).toBe('value1');
            expect(cache.get(sym2)).toBe('value2');
        });
    });

    describe('Delete Edge Cases', () => {
        it('should handle deleting same key multiple times', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('key', 123);
            expect(cache.delete('key')).toBe(true);
            expect(cache.delete('key')).toBe(false);
            expect(cache.delete('key')).toBe(false);
        });

        it('should handle delete during iteration', () => {
            const cache = new LRUCache<number, string>({
                maxSize: 10,
            });

            for (let i = 0; i < 5; i++) {
                cache.set(i, `value-${i}`);
            }

            const entries = Array.from(cache.entries());
            entries.forEach(([key]) => {
                cache.delete(key);
            });

            expect(cache.size).toBe(0);
        });
    });

    describe('Clear Edge Cases', () => {
        it('should handle multiple consecutive clears', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('key', 123);
            cache.clear();
            cache.clear();
            cache.clear();

            expect(cache.size).toBe(0);
        });

        it('should allow operations after clear', () => {
            const cache = new LRUCache<string, number>({
                maxSize: 10,
            });

            cache.set('key1', 1);
            cache.clear();
            cache.set('key2', 2);

            expect(cache.size).toBe(1);
            expect(cache.get('key2')).toBe(2);
            expect(cache.has('key1')).toBe(false);
        });
    });
});
