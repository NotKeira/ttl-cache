# LRU Cache CLI Example

Interactive CLI demonstrating `@notkeira/ttl-cache` functionality.

## Features

- Max 5 cached items with LRU eviction
- 30 second TTL on all entries
- Interactive command interface

## Install
```bash
pnpm install
```

## Run
```bash
pnpm start
```

## Commands

- `set <key> <value>` - Store a value
- `get <key>` - Retrieve a value
- `has <key>` - Check if key exists
- `delete <key>` - Remove a key
- `list` - Show all cached items
- `clear` - Remove all items
- `stats` - Show cache statistics
- `exit` - Exit the CLI

## Example
```
> set user:123 Alice
✅ Set 'user:123' = 'Alice'

> get user:123
✅ 'user:123' = 'Alice'

> list
📋 Cache contents (1 items):
  user:123: Alice
```
