import {createCacheEntry, getCacheEntryTTL, isCacheEntryExpired, isDiscordAvailable, LRUCache, version,} from '../src';

describe('Package Exports', () => {
    it('should export version', () => {
        expect(version).toBe('0.2.0');
    });

    it('should export LRUCache class', () => {
        expect(LRUCache).toBeDefined();
        expect(typeof LRUCache).toBe('function');
    });
});

describe('LRUCache', () => {
    it('should create cache instance with valid options', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        expect(cache).toBeInstanceOf(LRUCache);
    });

    it('should set and get values', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 100);
        expect(cache.get('key1')).toBe(100);
    });

    it('should return undefined for non-existent keys', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should check if key exists with has()', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 100);
        expect(cache.has('key1')).toBe(true);
        expect(cache.has('key2')).toBe(false);
    });

    it('should delete entries', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 100);
        expect(cache.delete('key1')).toBe(true);
        expect(cache.has('key1')).toBe(false);
        expect(cache.delete('key1')).toBe(false);
    });

    it('should clear all entries', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 100);
        cache.set('key2', 200);
        cache.clear();

        expect(cache.size).toBe(0);
        expect(cache.has('key1')).toBe(false);
    });

    it('should report correct size', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        expect(cache.size).toBe(0);
        cache.set('key1', 100);
        expect(cache.size).toBe(1);
        cache.set('key2', 200);
        expect(cache.size).toBe(2);
    });

    it('should evict oldest entry when maxSize is reached', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 3,
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

    it('should update LRU order on get()', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 3,
        });

        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        cache.get('key1'); // Move key1 to end
        cache.set('key4', 4); // Should evict key2

        expect(cache.has('key1')).toBe(true);
        expect(cache.has('key2')).toBe(false);
        expect(cache.has('key3')).toBe(true);
        expect(cache.has('key4')).toBe(true);
    });

    it('should handle TTL expiry', (done: () => void) => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
            ttl: 100, // 100ms
        });

        cache.set('key1', 100);
        expect(cache.get('key1')).toBe(100);

        setTimeout(() => {
            expect(cache.get('key1')).toBeUndefined();
            expect(cache.has('key1')).toBe(false);
            done();
        }, 150);
    });

    it('should iterate over keys', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        const keys = Array.from(cache.keys());
        expect(keys).toHaveLength(3);
        expect(keys).toContain('key1');
        expect(keys).toContain('key2');
        expect(keys).toContain('key3');
    });

    it('should iterate over values', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        const values = Array.from(cache.values());
        expect(values).toHaveLength(3);
        expect(values).toContain(1);
        expect(values).toContain(2);
        expect(values).toContain(3);
    });

    it('should iterate over entries', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 1);
        cache.set('key2', 2);

        const entries = Array.from(cache.entries());
        expect(entries).toHaveLength(2);
        expect(entries).toContainEqual(['key1', 1]);
        expect(entries).toContainEqual(['key2', 2]);
    });

    it('should execute forEach callback', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 1);
        cache.set('key2', 2);

        const entries: [string, number][] = [];
        cache.forEach((value, key) => {
            entries.push([key, value]);
        });

        expect(entries).toHaveLength(2);
        expect(entries).toContainEqual(['key1', 1]);
        expect(entries).toContainEqual(['key2', 2]);
    });
});

describe('Cache Entry Utilities', () => {
    it('should create cache entry', () => {
        const entry = createCacheEntry('value', Date.now() + 1000);

        expect(entry).toHaveProperty('value', 'value');
        expect(entry).toHaveProperty('expiry');
        expect(typeof entry.expiry).toBe('number');
    });

    it('should check if entry is expired', () => {
        const expiredEntry = createCacheEntry('value', Date.now() - 1000);
        const validEntry = createCacheEntry('value', Date.now() + 1000);

        expect(isCacheEntryExpired(expiredEntry)).toBe(true);
        expect(isCacheEntryExpired(validEntry)).toBe(false);
    });

    it('should get TTL of entry', () => {
        const ttl = 5000;
        const entry = createCacheEntry('value', Date.now() + ttl);

        const remainingTTL = getCacheEntryTTL(entry);
        expect(remainingTTL).toBeGreaterThan(0);
        expect(remainingTTL).toBeLessThanOrEqual(ttl);
    });

    it('should return 0 TTL for expired entry', () => {
        const entry = createCacheEntry('value', Date.now() - 1000);

        expect(getCacheEntryTTL(entry)).toBe(0);
    });
});

describe('Collection Utilities', () => {
    it('should check if discord.js is available', () => {
        const available = isDiscordAvailable();
        expect(typeof available).toBe('boolean');
    });
});
