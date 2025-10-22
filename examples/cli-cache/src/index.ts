import { LRUCache } from '@notkeira/ttl-cache';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Create a cache with max 5 items and 30 second TTL
const cache = new LRUCache<string, string>({
    maxSize: 5,
    ttl: 30000, // 30 seconds
});

const rl = readline.createInterface({ input, output });

console.log('🗄️  LRU Cache CLI Demo');
console.log('Commands: set <key> <value> | get <key> | has <key> | delete <key> | list | clear | stats | exit\n');

async function main() {
    while (true) {
        const line = await rl.question('> ');
        const [command, ...args] = line.trim().split(' ');

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
                console.log(`${exists ? '✅' : '❌'} Key '${key}' ${exists ? 'exists' : 'does not exist'}`);
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

            case 'list': {
                console.log(`\n📋 Cache contents (${cache.size} items):`);
                if (cache.size === 0) {
                    console.log('  (empty)');
                } else {
                    for (const [key, value] of cache.entries()) {
                        console.log(`  ${key}: ${value}`);
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
                console.log(`\n📊 Cache statistics:`);
                console.log(`  Size: ${cache.size} / 5`);
                console.log(`  TTL: 30 seconds`);
                console.log();
                break;
            }

            case 'exit':
            case 'quit': {
                console.log('👋 Goodbye!');
                rl.close();
                process.exit(0);
            }

            case 'help': {
                console.log('\n📖 Available commands:');
                console.log('  set <key> <value>  - Store a value');
                console.log('  get <key>          - Retrieve a value');
                console.log('  has <key>          - Check if key exists');
                console.log('  delete <key>       - Remove a key');
                console.log('  list               - Show all cached items');
                console.log('  clear              - Remove all items');
                console.log('  stats              - Show cache statistics');
                console.log('  exit               - Exit the CLI\n');
                break;
            }

            default: {
                if (command) {
                    console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
                }
                break;
            }
        }
    }
}

main().catch(console.error);