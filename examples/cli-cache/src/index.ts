import {LRUCache} from '@notkeira/ttl-cache';
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';

// Create a cache with max 10 items, 60 second TTL, sliding TTL, and stats enabled
const cache = new LRUCache<string, string>({
    maxSize: 10,
    ttl: 60000, // 60 seconds
    slidingTTL: true, // Extend TTL on access
    enableStats: true,
});

// Monitor cache events
cache.on('set', (key, value, isUpdate) => {
    if (!isUpdate) {
        console.log(`✨ New entry: '${key}'`);
    }
});

cache.on('evict', (key, value, reason) => {
    console.log(`🗑️  Evicted '${key}' (reason: ${reason})`);
});

cache.on('expire', (key, value) => {
    console.log(`⏰ Expired '${key}'`);
});

const rl = readline.createInterface({input, output});

console.log('🗄️  Enhanced LRU Cache CLI Demo');
console.log('Features: TTL, Sliding Window, Statistics, Events');
console.log('\nCommands:');
console.log('  set <key> <value>       - Store a value');
console.log('  setttl <key> <value> <ms> - Store with custom TTL');
console.log('  get <key>               - Retrieve a value (extends TTL)');
console.log('  peek <key>              - View without extending TTL');
console.log('  has <key>               - Check if key exists');
console.log('  ttl <key>               - Get remaining TTL');
console.log('  touch <key> [ms]        - Extend TTL');
console.log('  delete <key>            - Remove a key');
console.log('  pattern <regex>         - Delete by pattern');
console.log('  list                    - Show all cached items');
console.log('  clear                   - Remove all items');
console.log('  stats                   - Show cache statistics');
console.log('  help                    - Show this help');
console.log('  exit                    - Exit the CLI\n');

async function main() {
    while (true) {
        const line = await rl.question('> ');
        const [command, ...args] = line.trim().split(' ');

        try {
            switch (command.toLowerCase()) {
                case 'set': {
                    const [key, ...valueParts] = args;
                    const value = valueParts.join(' ');
                    if (!key || !value) {
                        console.log('❌ Usage: set <key> <value>');
                        break;
                    }
                    cache.set(key, value);
                    console.log(`✅ Set '${key}' = '${value}'`);
                    break;
                }

                case 'setttl': {
                    const [key, ...rest] = args;
                    const ttl = parseInt(rest[rest.length - 1]);
                    const valueParts = rest.slice(0, -1);
                    const value = valueParts.join(' ');

                    if (!key || !value || isNaN(ttl)) {
                        console.log('❌ Usage: setttl <key> <value> <milliseconds>');
                        break;
                    }
                    cache.setWithTTL(key, value, ttl);
                    console.log(`✅ Set '${key}' = '${value}' (TTL: ${ttl}ms)`);
                    break;
                }

                case 'get': {
                    const key = args[0];
                    if (!key) {
                        console.log('❌ Usage: get <key>');
                        break;
                    }
                    const value = cache.get(key);
                    if (value === undefined) {
                        console.log(`❌ Key '${key}' not found or expired`);
                    } else {
                        console.log(`✅ '${key}' = '${value}'`);
                        const ttl = cache.getTTL(key);
                        if (ttl) {
                            console.log(`   TTL extended to ${Math.round(ttl / 1000)}s`);
                        }
                    }
                    break;
                }

                case 'peek': {
                    const key = args[0];
                    if (!key) {
                        console.log('❌ Usage: peek <key>');
                        break;
                    }
                    const value = cache.peek(key);
                    if (value === undefined) {
                        console.log(`❌ Key '${key}' not found or expired`);
                    } else {
                        console.log(`👀 '${key}' = '${value}' (no TTL extension)`);
                    }
                    break;
                }

                case 'has': {
                    const key = args[0];
                    if (!key) {
                        console.log('❌ Usage: has <key>');
                        break;
                    }
                    const exists = cache.has(key);
                    console.log(
                        `${exists ? '✅' : '❌'} Key '${key}' ${exists ? 'exists' : 'does not exist'}`
                    );
                    break;
                }

                case 'ttl': {
                    const key = args[0];
                    if (!key) {
                        console.log('❌ Usage: ttl <key>');
                        break;
                    }
                    const ttl = cache.getTTL(key);
                    if (ttl === null) {
                        console.log(`❌ Key '${key}' not found or has no TTL`);
                    } else {
                        console.log(`⏱️  '${key}' expires in ${Math.round(ttl / 1000)}s`);
                    }
                    break;
                }

                case 'touch': {
                    const key = args[0];
                    const ttl = args[1] ? parseInt(args[1]) : undefined;
                    if (!key) {
                        console.log('❌ Usage: touch <key> [milliseconds]');
                        break;
                    }
                    const success = cache.touch(key, ttl);
                    if (success) {
                        console.log(
                            `✅ Extended TTL for '${key}'${ttl ? ` to ${ttl}ms` : ''}`
                        );
                    } else {
                        console.log(`❌ Key '${key}' not found`);
                    }
                    break;
                }

                case 'delete': {
                    const key = args[0];
                    if (!key) {
                        console.log('❌ Usage: delete <key>');
                        break;
                    }
                    const deleted = cache.delete(key);
                    if (deleted) {
                        console.log(`✅ Deleted '${key}'`);
                    } else {
                        console.log(`❌ Key '${key}' not found`);
                    }
                    break;
                }

                case 'pattern': {
                    const pattern = args[0];
                    if (!pattern) {
                        console.log('❌ Usage: pattern <regex>');
                        break;
                    }
                    const regex = new RegExp(pattern);
                    const deleted = cache.deleteByPattern(regex);
                    console.log(`✅ Deleted ${deleted} entries matching /${pattern}/`);
                    break;
                }

                case 'list': {
                    console.log(`\n📋 Cache contents (${cache.size} items):`);
                    if (cache.size === 0) {
                        console.log('  (empty)');
                    } else {
                        for (const [key, value] of cache.entries()) {
                            const ttl = cache.getTTL(key);
                            const ttlStr = ttl ? ` [${Math.round(ttl / 1000)}s]` : '';
                            console.log(`  ${key}: ${value}${ttlStr}`);
                        }
                    }
                    console.log();
                    break;
                }

                case 'clear': {
                    cache.clear();
                    console.log('✅ Cache cleared');
                    break;
                }

                case 'stats': {
                    const stats = cache.getStats();
                    console.log(`\n📊 Cache statistics:`);
                    console.log(`  Size: ${stats.size} / ${stats.maxSize}`);
                    console.log(`  Hits: ${stats.hits}`);
                    console.log(`  Misses: ${stats.misses}`);
                    console.log(
                        `  Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`
                    );
                    console.log(`  Evictions: ${stats.evictions}`);
                    console.log(`  Expirations: ${stats.expirations}`);
                    console.log(`  Default TTL: 60 seconds (sliding)`);
                    console.log();
                    break;
                }

                case 'exit':
                case 'quit': {
                    console.log('👋 Goodbye!');
                    cache.dispose();
                    rl.close();
                    process.exit(0);
                }

                case 'help': {
                    console.log('\n📖 Available commands:');
                    console.log('  set <key> <value>          - Store a value');
                    console.log(
                        '  setttl <key> <value> <ms>  - Store with custom TTL'
                    );
                    console.log('  get <key>                  - Retrieve and extend TTL');
                    console.log('  peek <key>                 - View without extending TTL');
                    console.log('  has <key>                  - Check if key exists');
                    console.log('  ttl <key>                  - Get remaining TTL');
                    console.log('  touch <key> [ms]           - Extend TTL');
                    console.log('  delete <key>               - Remove a key');
                    console.log('  pattern <regex>            - Delete by pattern');
                    console.log('  list                       - Show all cached items');
                    console.log('  clear                      - Remove all items');
                    console.log('  stats                      - Show cache statistics');
                    console.log('  exit                       - Exit the CLI\n');
                    break;
                }

                default: {
                    if (command) {
                        console.log(
                            `❌ Unknown command: ${command}. Type 'help' for available commands.`
                        );
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : error);
        }
    }
}

main().catch(console.error);