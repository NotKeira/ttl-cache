# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ESLint configuration with TypeScript support
- Linting scripts (`lint` and `lint:fix`) for code quality enforcement

### Changed

- ESLint configuration migration from .eslintrc.json to eslint.config.mjs

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

[unreleased]: https://github.com/notkeira/ttl-cache/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/notkeira/ttl-cache/releases/tag/v0.1.0
