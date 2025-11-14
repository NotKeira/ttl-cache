import {createCacheEntry, getCacheEntryTTL, isCacheEntryExpired, LRUCache,} from '../src';

describe('Package Exports', () => {
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

    it('should handle has() correctly', () => {
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

        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        cache.clear();
        expect(cache.size).toBe(0);
    });

    it('should respect maxSize and evict LRU', () => {
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

    it('should handle iteration', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        const keys = Array.from(cache.keys());
        expect(keys).toContain('key1');
        expect(keys).toContain('key2');
        expect(keys).toContain('key3');

        const values = Array.from(cache.values());
        expect(values).toContain(1);
        expect(values).toContain(2);
        expect(values).toContain(3);

        const entries = Array.from(cache.entries());
        expect(entries).toContainEqual(['key1', 1]);
        expect(entries).toContainEqual(['key2', 2]);
        expect(entries).toContainEqual(['key3', 3]);
    });

    it('should handle forEach', () => {
        const cache = new LRUCache<string, number>({
            maxSize: 10,
        });

        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        const collected: Array<[string, number]> = [];
        cache.forEach((value, key) => {
            collected.push([key, value]);
        });

        expect(collected.length).toBe(3);
        expect(collected).toContainEqual(['key1', 1]);
        expect(collected).toContainEqual(['key2', 2]);
        expect(collected).toContainEqual(['key3', 3]);
    });

    it('should throw error if neither maxSize nor maxMemoryBytes specified', () => {
        expect(() => {
            new LRUCache<string, number>({} as any);
        }).toThrow('Either maxSize or maxMemoryBytes must be specified');
    });
});

describe('Cache Entry Utilities', () => {
    it('should create cache entries', () => {
        const entry = createCacheEntry('value', Date.now() + 1000);
        expect(entry.value).toBe('value');
        expect(entry.expiry).toBeGreaterThan(Date.now());
    });

    it('should detect expired entries', () => {
        const expiredEntry = createCacheEntry('value', Date.now() - 1000);
        expect(isCacheEntryExpired(expiredEntry)).toBe(true);

        const validEntry = createCacheEntry('value', Date.now() + 1000);
        expect(isCacheEntryExpired(validEntry)).toBe(false);
    });

    it('should get TTL for entries', () => {
        const entry = createCacheEntry('value', Date.now() + 1000);
        const ttl = getCacheEntryTTL(entry);
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(1000);
    });
});