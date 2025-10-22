import {isDiscordAvailable, loadDiscordCollection, LRUCache, validateDiscordCollection} from '../src';

describe('Discord.js Collection Integration', () => {
    const discordAvailable = isDiscordAvailable();

    describe('Collection Availability Checks', () => {
        it('should correctly report discord.js availability', () => {
            expect(typeof discordAvailable).toBe('boolean');
        });

        it('should validate discord.js Collection if available', () => {
            if (discordAvailable) {
                expect(validateDiscordCollection()).toBe(true);
            } else {
                expect(validateDiscordCollection()).toBe(false);
            }
        });

        it('should load Collection class if available', () => {
            if (discordAvailable) {
                expect(() => loadDiscordCollection()).not.toThrow();
                const Collection = loadDiscordCollection();
                expect(Collection).toBeDefined();
            } else {
                expect(() => loadDiscordCollection()).toThrow('discord.js not installed');
            }
        });
    });

    describe('Cache with Collection Backend', () => {
        it('should throw error when useCollection is true but discord.js not installed', () => {
            if (!discordAvailable) {
                expect(() => {
                    new LRUCache<string, number>({
                        maxSize: 10,
                        useCollection: true,
                    });
                }).toThrow('discord.js not installed');
            }
        });

        if (discordAvailable) {
            it('should create cache with Collection backend', () => {
                const cache = new LRUCache<string, number>({
                    maxSize: 10,
                    useCollection: true,
                });

                expect(cache).toBeInstanceOf(LRUCache);
            });

            it('should perform basic operations with Collection backend', () => {
                const cache = new LRUCache<string, number>({
                    maxSize: 10,
                    useCollection: true,
                });

                cache.set('key1', 100);
                cache.set('key2', 200);
                cache.set('key3', 300);

                expect(cache.get('key1')).toBe(100);
                expect(cache.get('key2')).toBe(200);
                expect(cache.get('key3')).toBe(300);
                expect(cache.size).toBe(3);
            });

            it('should handle LRU eviction with Collection backend', () => {
                const cache = new LRUCache<string, number>({
                    maxSize: 3,
                    useCollection: true,
                });

                cache.set('key1', 1);
                cache.set('key2', 2);
                cache.set('key3', 3);
                cache.set('key4', 4); // Should evict key1

                expect(cache.has('key1')).toBe(false);
                expect(cache.has('key2')).toBe(true);
                expect(cache.has('key3')).toBe(true);
                expect(cache.has('key4')).toBe(true);
                expect(cache.size).toBe(3);
            });

            it('should handle TTL with Collection backend', (done) => {
                const cache = new LRUCache<string, number>({
                    maxSize: 10,
                    ttl: 100,
                    useCollection: true,
                });

                cache.set('key', 123);
                expect(cache.get('key')).toBe(123);

                setTimeout(() => {
                    expect(cache.get('key')).toBeUndefined();
                    expect(cache.has('key')).toBe(false);
                    done();
                }, 150);
            });

            it('should iterate with Collection backend', () => {
                const cache = new LRUCache<string, number>({
                    maxSize: 5,
                    useCollection: true,
                });

                cache.set('a', 1);
                cache.set('b', 2);
                cache.set('c', 3);

                const keys = Array.from(cache.keys());
                const values = Array.from(cache.values());
                const entries = Array.from(cache.entries());

                expect(keys).toEqual(['a', 'b', 'c']);
                expect(values).toEqual([1, 2, 3]);
                expect(entries).toEqual([['a', 1], ['b', 2], ['c', 3]]);
            });

            it('should handle forEach with Collection backend', () => {
                const cache = new LRUCache<string, number>({
                    maxSize: 5,
                    useCollection: true,
                });

                cache.set('a', 1);
                cache.set('b', 2);
                cache.set('c', 3);

                const result: Array<[string, number]> = [];
                cache.forEach((value, key) => {
                    result.push([key, value]);
                });

                expect(result).toHaveLength(3);
                expect(result).toContainEqual(['a', 1]);
                expect(result).toContainEqual(['b', 2]);
                expect(result).toContainEqual(['c', 3]);
            });

            it('should handle delete with Collection backend', () => {
                const cache = new LRUCache<string, number>({
                    maxSize: 10,
                    useCollection: true,
                });

                cache.set('key1', 1);
                cache.set('key2', 2);

                expect(cache.delete('key1')).toBe(true);
                expect(cache.has('key1')).toBe(false);
                expect(cache.has('key2')).toBe(true);
                expect(cache.size).toBe(1);
            });

            it('should handle clear with Collection backend', () => {
                const cache = new LRUCache<string, number>({
                    maxSize: 10,
                    useCollection: true,
                });

                cache.set('key1', 1);
                cache.set('key2', 2);
                cache.set('key3', 3);

                cache.clear();

                expect(cache.size).toBe(0);
                expect(cache.has('key1')).toBe(false);
            });

            it('should handle large dataset with Collection backend', () => {
                const cache = new LRUCache<number, string>({
                    maxSize: 1000,
                    useCollection: true,
                });

                for (let i = 0; i < 1000; i++) {
                    cache.set(i, `value-${i}`);
                }

                expect(cache.size).toBe(1000);

                // Add more to trigger eviction
                for (let i = 1000; i < 1500; i++) {
                    cache.set(i, `value-${i}`);
                }

                expect(cache.size).toBe(1000);
                expect(cache.has(0)).toBe(false);
                expect(cache.has(1499)).toBe(true);
            });

            it('should maintain LRU order with Collection backend', () => {
                const cache = new LRUCache<number, number>({
                    maxSize: 3,
                    useCollection: true,
                });

                cache.set(1, 1);
                cache.set(2, 2);
                cache.set(3, 3);

                cache.get(1); // Move 1 to end
                cache.set(4, 4); // Should evict 2

                expect(cache.has(1)).toBe(true);
                expect(cache.has(2)).toBe(false);
                expect(cache.has(3)).toBe(true);
                expect(cache.has(4)).toBe(true);
            });
        }
    });

    describe('Comparison: Map vs Collection', () => {
        if (discordAvailable) {
            it('should behave identically with Map and Collection backends', () => {
                const mapCache = new LRUCache<string, number>({
                    maxSize: 10,
                    useCollection: false,
                });

                const collectionCache = new LRUCache<string, number>({
                    maxSize: 10,
                    useCollection: true,
                });

                // Perform identical operations
                const operations = [
                    ['set', 'a', 1],
                    ['set', 'b', 2],
                    ['set', 'c', 3],
                    ['get', 'a'],
                    ['delete', 'b'],
                    ['set', 'd', 4],
                ];

                operations.forEach(([op, key, value]) => {
                    if (op === 'set') {
                        mapCache.set(key as string, value as number);
                        collectionCache.set(key as string, value as number);
                    } else if (op === 'get') {
                        expect(mapCache.get(key as string)).toBe(collectionCache.get(key as string));
                    } else if (op === 'delete') {
                        expect(mapCache.delete(key as string)).toBe(collectionCache.delete(key as string));
                    }
                });

                expect(mapCache.size).toBe(collectionCache.size);
                expect(Array.from(mapCache.keys())).toEqual(Array.from(collectionCache.keys()));
                expect(Array.from(mapCache.values())).toEqual(Array.from(collectionCache.values()));
            });
        }
    });
});
