# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2025-10-23

### Added
- Comments and Documentation added back (oversight from tsconfig)

### Removed
- `removeComments` from `tsconfig.json`


### BREAKING CHANGES
- Documentation reinstated for build, oversight from `tsconfig.json` removed the comments, which subsequently removed documentation, causing editors to not see the descriptions and nodes of functions or types.

## [0.2.0] - 2025-10-22

### Added

- Full LRU cache implementation with working eviction policy
- Comprehensive test suite covering:
    - Performance benchmarks for sequential/mixed operations and large datasets
    - Concurrent-like operation patterns and stress tests
    - Edge cases (empty cache, single item, maxSize boundaries, TTL edge cases)
    - Discord.js Collection integration tests
    - LRU ordering verification and complex access patterns
- Entry utility functions for cache management
- Collection utility functions for discord.js integration

### Changed

- Replaced placeholder implementation with complete working LRU cache
- Optimised `entries()` and `values()` methods using lazy generators instead of array allocation
- Updated performance test assertions to use sampling instead of per-iteration checks

### Fixed

- ESLint flat config compatibility with ignorePatterns vs globalIgnores
- Type safety by replacing `any` with `typeof Map` for Collection types
- LRU ordering test expectations after item deletion
- Performance test thresholds to account for CI environment variability

### Performance

- Iteration over large datasets now uses generators for memory efficiency
- Reduced overhead in performance benchmarks by sampling assertions

## [0.1.0] - 2025-10-22

### Added

- Initial release of `@notkeira/ttl-cache`
- **Core Features:**
    - LRU (Least Recently Used) cache implementation with automatic eviction
    - Optional TTL (Time To Live) support for cache entries
    - Full Map-like interface (`get`, `set`, `has`, `delete`, `clear`, `size`)
    - Iterator support (`keys()`, `values()`, `entries()`, `forEach()`)
    - Optional discord.js Collection backing store
    - TypeScript support with full type definitions

- **API:**
    - `LRUCache` class with configurable `maxSize`, `ttl`, and `useCollection` options
    - Automatic expiry pruning on access operations
    - LRU order updates on `get()` operations
    - Entry utilities: `createCacheEntry`, `isCacheEntryExpired`, `getCacheEntryTTL`
    - Collection utilities: `loadDiscordCollection`, `isDiscordAvailable`, `validateDiscordCollection`

- **Developer Experience:**
    - Comprehensive JSDoc documentation for all public APIs
    - Jest test suite with full coverage
    - TypeScript compilation with declaration files
    - ESLint configuration for code quality
    - Automated CI/CD workflows (GitHub Actions)
    - Codecov integration for test coverage tracking

- **Documentation:**
    - README with installation instructions and usage examples
    - MIT licence (Copyright 2025 Keira Hopkins)
    - CI status badge

### Infrastructure

- GitHub Actions CI workflow for linting, type checking, testing, and building
- GitHub Actions publish workflow for automated NPM releases
- Jest configuration with ts-jest for TypeScript testing
- TypeScript compiler configuration with strict mode
- PNPM package manager with lockfile
- Codecov integration for coverage reporting

[unreleased]: https://github.com/notkeira/ttl-cache/compare/v0.2.0...HEAD
[0.2.1]: https://github.com/notkeira/ttl-cache/compare/v0.2.1...v0.2.0
[0.2.0]: https://github.com/notkeira/ttl-cache/compare/v0.2.0...v0.1.0
[0.1.0]: https://github.com/notkeira/ttl-cache/releases/tag/v0.1.0
