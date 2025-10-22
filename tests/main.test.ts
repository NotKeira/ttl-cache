import {LRUCache, version} from '../src';

describe('LRUCache', () => {
    it('should export version', () => {
        expect(version).toBe('0.1.0');
    });

    it('should throw under development error', () => {
        expect(() => new LRUCache()).toThrow('Under development - not yet implemented');
    });
});
