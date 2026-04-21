#!/usr/bin/env node

/**
 * Skales DevKit CLI — Command-line interface for Skales
 *
 * Usage:
 *   node skales.js chat                        Interactive chat
 *   node skales.js chat "what's the weather"   One-shot message
 *   node skales.js tools                       List available tools
 *   node skales.js model                       Show current model
 *   node skales.js model <provider> <model>    Switch model
 *   node skales.js status                      System status
 *   node skales.js memory                      List memories
 *   node skales.js sessions                    List sessions
 *   node skales.js migrate --from <source>     Import from another agent
 *   node skales.js mcp [subcommand]            Manage MCP servers
 *   node skales.js cron [subcommand]           Manage scheduled tasks
 *   node skales.js --version                   Print CLI version
 *
 * Requires: Node.js 18+ (uses fetch, built-in modules only)
 * Auth: Reads token from ../devkit.json
 */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── ANSI Colors ────────────────────────────────────────────

const C = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    red:     '\x1b[31m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    blue:    '\x1b[34m',
    magenta: '\x1b[35m',
    cyan:    '\x1b[36m',
    white:   '\x1b[37m',
    gray:    '\x1b[90m',
    bgRed:   '\x1b[41m',
    bgGreen: '\x1b[42m',
};

// ─── Config ─────────────────────────────────────────────────

const CLI_VERSION = '0.2.0';
const DEVKIT_CONFIG_PATH = path.join(__dirname, '..', 'devkit.json');
const BASE_URL = process.env.SKALES_URL || 'http://localhost:3000';

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(DEVKIT_CONFIG_PATH, 'utf-8'));
    } catch (err) {
        console.error(`${C.red}Error: Could not read devkit.json at ${DEVKIT_CONFIG_PATH}${C.reset}`);
        console.error(`${C.dim}Make sure you're running from the devkit/cli/ directory.${C.reset}`);
        process.exit(1);
    }
}

// Commands that do not need config or a running Skales instance
const CONFIG_FREE_COMMANDS = new Set(['--version', '-v', 'help', '--help', '-h']);
const _earlyCommand = (process.argv[2] || '');
const config = CONFIG_FREE_COMMANDS.has(_earlyCommand) ? {} : loadConfig();
const TOKEN = (config && config.api && config.api.token) || '';

// ─── HTTP Helpers (Node.js built-in only) ───────────────────

function request(method, urlPath, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, BASE_URL);
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method,
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
        };

        const req = lib.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data, raw: true });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function streamRequest(urlPath, body, onData) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, BASE_URL);
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
        };

        const req = lib.request(options, (res) => {
            if (res.statusCode !== 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try { reject(new Error(JSON.parse(data).error || `HTTP ${res.statusCode}`)); }
                    catch { reject(new Error(`HTTP ${res.statusCode}: ${data}`)); }
                });
                return;
            }

            let buffer = '';
            res.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6));
                            onData(event);
                        } catch { /* skip malformed events */ }
                    }
                }
            });

            res.on('end', () => {
                // Process remaining buffer
                if (buffer.startsWith('data: ')) {
                    try {
                        const event = JSON.parse(buffer.slice(6));
                        onData(event);
                    } catch { /* skip */ }
                }
                resolve();
            });
        });

        req.on('error', reject);
        req.setTimeout(120000, () => { req.destroy(); reject(new Error('Request timeout')); });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ─── Commands ───────────────────────────────────────────────

async function cmdStatus() {
    try {
        const { status, data } = await request('GET', '/api/cli/status');
        if (status !== 200) {
            console.error(`${C.red}Error: ${data.error || 'Unknown error'}${C.reset}`);
            return;
        }

        console.log(`\n${C.bold}${C.cyan}  Skales Status${C.reset}\n`);
        console.log(`${C.dim}  ─────────────────────────────${C.reset}`);
        console.log(`  ${C.gray}App:${C.reset}        ${data.app} v${data.version}`);
        console.log(`  ${C.gray}Provider:${C.reset}   ${C.green}${data.provider}${C.reset}`);
        console.log(`  ${C.gray}Model:${C.reset}      ${C.green}${data.model}${C.reset}`);
        console.log(`  ${C.gray}Memories:${C.reset}   ${data.memory_count}`);
        console.log(`  ${C.gray}Sessions:${C.reset}   ${data.session_count}`);
        console.log(`  ${C.gray}Tools:${C.reset}      ${data.tools_count}`);
        console.log(`  ${C.gray}Uptime:${C.reset}     ${formatDuration(data.uptime_ms)}`);
        console.log(`  ${C.gray}DevKit:${C.reset}     v${data.devkit_version}`);
        console.log();
    } catch (err) {
        console.error(`${C.red}Error: ${err.message}${C.reset}`);
        console.error(`${C.dim}Is Skales running on ${BASE_URL}?${C.reset}`);
    }
}

async function cmdTools() {
    try {
        const { status, data } = await request('GET', '/api/cli/tools');
        if (status !== 200) {
            console.error(`${C.red}Error: ${data.error || 'Unknown error'}${C.reset}`);
            return;
        }

        console.log(`\n${C.bold}${C.cyan}  Available Tools (${data.tools.length})${C.reset}\n`);
        for (const tool of data.tools) {
            const statusIcon = tool.enabled ? `${C.green}●${C.reset}` : `${C.red}○${C.reset}`;
            console.log(`  ${statusIcon} ${C.bold}${tool.name}${C.reset}`);
            if (tool.description) {
                console.log(`    ${C.dim}${tool.description.slice(0, 80)}${C.reset}`);
            }
        }
        console.log();
    } catch (err) {
        console.error(`${C.red}Error: ${err.message}${C.reset}`);
    }
}

async function cmdModel(args) {
    try {
        if (args.length === 0) {
            // GET current model
            const { status, data } = await request('GET', '/api/cli/model');
            if (status !== 200) {
                console.error(`${C.red}Error: ${data.error || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`\n  ${C.gray}Provider:${C.reset} ${C.green}${data.provider}${C.reset}`);
            console.log(`  ${C.gray}Model:${C.reset}    ${C.green}${data.model}${C.reset}`);
            console.log();
        } else if (args.length >= 2) {
            // PUT: switch model
            const [provider, model] = args;
            const { status, data } = await request('PUT', '/api/cli/model', { provider, model });
            if (status !== 200) {
                console.error(`${C.red}Error: ${data.error || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`${C.green}  ✓ Switched to ${data.provider} / ${data.model}${C.reset}`);
        } else {
            console.error(`${C.red}Usage: skales model <provider> <model>${C.reset}`);
        }
    } catch (err) {
        console.error(`${C.red}Error: ${err.message}${C.reset}`);
    }
}

async function cmdMemory() {
    try {
        const { status, data } = await request('GET', '/api/cli/memory');
        if (status !== 200) {
            console.error(`${C.red}Error: ${data.error || 'Unknown error'}${C.reset}`);
            return;
        }

        console.log(`\n${C.bold}${C.cyan}  Memories (${data.count})${C.reset}\n`);
        for (const mem of data.memories) {
            const catColor = {
                preference: C.magenta, fact: C.blue, action_item: C.yellow,
                contact: C.cyan, url: C.green, location: C.red, topic: C.white,
            }[mem.category] || C.gray;

            console.log(`  ${catColor}[${mem.category}]${C.reset} ${mem.content}`);
            console.log(`  ${C.dim}id: ${mem.id} | ${new Date(mem.extracted_at).toLocaleDateString()}${C.reset}`);
            console.log();
        }

        if (data.count === 0) {
            console.log(`  ${C.dim}No memories yet. Chat with Skales to build memory.${C.reset}\n`);
        }
    } catch (err) {
        console.error(`${C.red}Error: ${err.message}${C.reset}`);
    }
}

async function cmdSessions() {
    try {
        const { status, data } = await request('GET', '/api/cli/sessions');
        if (status !== 200) {
            console.error(`${C.red}Error: ${data.error || 'Unknown error'}${C.reset}`);
            return;
        }

        console.log(`\n${C.bold}${C.cyan}  Sessions (${data.count})${C.reset}\n`);
        for (const s of data.sessions.slice(0, 20)) {
            const date = s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'unknown';
            console.log(`  ${C.bold}${s.title}${C.reset}`);
            console.log(`  ${C.dim}id: ${s.id} | ${s.messageCount} msgs | ${s.provider}/${s.model} | ${date}${C.reset}`);
            console.log();
        }

        if (data.count === 0) {
            console.log(`  ${C.dim}No sessions yet.${C.reset}\n`);
        }
    } catch (err) {
        console.error(`${C.red}Error: ${err.message}${C.reset}`);
    }
}

// ─── Interactive Chat ───────────────────────────────────────

async function cmdChat(initialMessage) {
    let sessionId = null;

    if (initialMessage) {
        // One-shot mode
        await sendChatMessage(initialMessage, sessionId, (event) => {
            if (event.type === 'text') {
                process.stdout.write(`${C.green}${event.content}${C.reset}`);
            } else if (event.type === 'tool_call') {
                process.stdout.write(`\n${C.yellow}[🔧 ${event.tool}]${C.reset} `);
            } else if (event.type === 'tool_result') {
                process.stdout.write(`${C.dim}${event.result}${C.reset}\n`);
            } else if (event.type === 'done') {
                sessionId = event.sessionId;
            } else if (event.type === 'error') {
                process.stderr.write(`\n${C.red}Error: ${event.error}${C.reset}\n`);
            }
        });
        console.log('\n');
        return;
    }

    // Interactive mode
    console.log(`\n${C.bold}${C.cyan}  Skales DevKit Chat${C.reset}`);
    console.log(`${C.dim}  Type /new for new session, /model to switch, /tools to list, /status, /quit to exit${C.reset}\n`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: `${C.bold}${C.white}You > ${C.reset}`,
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const input = line.trim();
        if (!input) { rl.prompt(); return; }

        // Slash commands
        if (input === '/quit' || input === '/exit' || input === '/q') {
            console.log(`${C.dim}  Goodbye!${C.reset}\n`);
            rl.close();
            process.exit(0);
        }

        if (input === '/new') {
            sessionId = null;
            console.log(`${C.dim}  ✓ New session started${C.reset}\n`);
            rl.prompt();
            return;
        }

        if (input === '/model') {
            await cmdModel([]);
            rl.prompt();
            return;
        }

        if (input === '/tools') {
            await cmdTools();
            rl.prompt();
            return;
        }

        if (input === '/status') {
            await cmdStatus();
            rl.prompt();
            return;
        }

        // Send message
        process.stdout.write(`\n${C.green}`);

        await sendChatMessage(input, sessionId, (event) => {
            if (event.type === 'text') {
                process.stdout.write(event.content);
            } else if (event.type === 'tool_call') {
                process.stdout.write(`${C.reset}\n${C.yellow}  [🔧 ${event.tool}]${C.reset} `);
            } else if (event.type === 'tool_result') {
                process.stdout.write(`${C.dim}${event.result}${C.reset}`);
                process.stdout.write(`\n${C.green}`);
            } else if (event.type === 'done') {
                sessionId = event.sessionId;
            } else if (event.type === 'error') {
                process.stdout.write(`${C.reset}\n${C.red}Error: ${event.error}${C.reset}`);
            }
        });

        process.stdout.write(`${C.reset}\n\n`);
        rl.prompt();
    });

    rl.on('close', () => process.exit(0));
}

async function sendChatMessage(message, sessionId, onEvent) {
    const body = { message };
    if (sessionId) body.sessionId = sessionId;

    try {
        await streamRequest('/api/cli/chat', body, onEvent);
    } catch (err) {
        onEvent({ type: 'error', error: err.message });
    }
}

// ─── Migration ──────────────────────────────────────────────

async function cmdMigrate(args) {
    let source = null;
    let dryRun = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--from' && args[i + 1]) {
            source = args[++i].toLowerCase();
        } else if (args[i] === '--dry-run') {
            dryRun = true;
        }
    }

    if (!source) {
        console.log(`\n${C.bold}${C.cyan}  Skales Migration Tool${C.reset}\n`);
        console.log(`  Usage:`);
        console.log(`    node skales.js migrate --from hermes    ${C.dim}Import from Hermes${C.reset}`);
        console.log(`    node skales.js migrate --from openclaw  ${C.dim}Import from OpenClaw${C.reset}`);
        console.log(`    node skales.js migrate --dry-run        ${C.dim}Preview without changes${C.reset}`);
        console.log();
        return;
    }

    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const skalesDataDir = path.join(homeDir, '.skales-data');

    if (source === 'hermes') {
        await migrateHermes(homeDir, skalesDataDir, dryRun);
    } else if (source === 'openclaw') {
        await migrateOpenClaw(homeDir, skalesDataDir, dryRun);
    } else {
        console.error(`${C.red}  Unknown source: ${source}. Supported: hermes, openclaw${C.reset}\n`);
    }
}

async function migrateHermes(homeDir, skalesDataDir, dryRun) {
    const hermesDir = path.join(homeDir, '.hermes');

    console.log(`\n${C.bold}${C.cyan}  Migrating from Hermes${C.reset}\n`);

    if (!fs.existsSync(hermesDir)) {
        console.error(`${C.red}  Error: ~/.hermes/ not found${C.reset}\n`);
        return;
    }

    const found = { memories: [], skills: [], apiKeys: {}, model: null, provider: null };

    // Read cli-config.yaml (parse simple YAML key: value lines)
    const configPath = path.join(hermesDir, 'cli-config.yaml');
    if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const lines = raw.split('\n');
        for (const line of lines) {
            const match = line.match(/^(\w+)\s*:\s*(.+)$/);
            if (!match) continue;
            const [, key, value] = match;
            const val = value.trim().replace(/^["']|["']$/g, '');

            if (key === 'model') found.model = val;
            if (key === 'provider') found.provider = val;
            if (key.endsWith('_api_key') || key.endsWith('ApiKey')) {
                found.apiKeys[key] = val;
            }
        }
    }

    // Read memory files
    const memoryDir = path.join(hermesDir, 'memory');
    if (fs.existsSync(memoryDir)) {
        const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.json') || f.endsWith('.txt'));
        for (const file of files) {
            try {
                const raw = fs.readFileSync(path.join(memoryDir, file), 'utf-8');
                if (file.endsWith('.json')) {
                    const data = JSON.parse(raw);
                    if (Array.isArray(data)) found.memories.push(...data.map(m => typeof m === 'string' ? m : m.content || JSON.stringify(m)));
                    else if (data.content) found.memories.push(data.content);
                } else {
                    found.memories.push(raw.trim());
                }
            } catch { /* skip */ }
        }
    }

    // Read skills
    const skillsDir = path.join(hermesDir, 'skills');
    if (fs.existsSync(skillsDir)) {
        const files = fs.readdirSync(skillsDir);
        for (const file of files) {
            found.skills.push(file);
        }
    }

    // Report
    console.log(`  ${C.gray}Found:${C.reset}`);
    console.log(`    ${C.dim}Provider/Model:${C.reset} ${found.provider || 'none'} / ${found.model || 'none'}`);
    console.log(`    ${C.dim}API Keys:${C.reset}      ${Object.keys(found.apiKeys).length}`);
    console.log(`    ${C.dim}Memories:${C.reset}      ${found.memories.length}`);
    console.log(`    ${C.dim}Skills:${C.reset}        ${found.skills.length}`);
    console.log();

    if (dryRun) {
        console.log(`  ${C.yellow}DRY RUN — no changes made.${C.reset}\n`);
        return;
    }

    // Write memories
    const memoriesDir = path.join(skalesDataDir, 'memories');
    if (!fs.existsSync(memoriesDir)) fs.mkdirSync(memoriesDir, { recursive: true });

    let imported = 0;
    for (const mem of found.memories) {
        if (!mem || mem.length < 3) continue;
        const id = `mem_hermes_${Date.now()}_${imported}`;
        const entry = {
            id,
            category: 'fact',
            content: mem,
            source_conversation_id: 'hermes-migration',
            extracted_at: Date.now(),
            relevance_keywords: [],
        };
        fs.writeFileSync(path.join(memoriesDir, `${id}.json`), JSON.stringify(entry, null, 2));
        imported++;
    }

    // Update settings if we found provider/model
    if (found.provider || Object.keys(found.apiKeys).length > 0) {
        const settingsPath = path.join(skalesDataDir, 'settings.json');
        let settings = {};
        try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { /* new settings */ }

        // Map API keys
        for (const [key, val] of Object.entries(found.apiKeys)) {
            if (key.includes('openrouter') && settings.providers?.openrouter) {
                settings.providers.openrouter.apiKey = val;
            } else if (key.includes('openai') && settings.providers?.openai) {
                settings.providers.openai.apiKey = val;
            } else if (key.includes('anthropic') && settings.providers?.anthropic) {
                settings.providers.anthropic.apiKey = val;
            }
        }

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }

    console.log(`  ${C.green}✓ Imported ${imported} memories${C.reset}`);
    console.log(`  ${C.dim}Source files NOT deleted.${C.reset}\n`);
}

async function migrateOpenClaw(homeDir, skalesDataDir, dryRun) {
    const openclawDir = path.join(homeDir, '.openclaw');

    console.log(`\n${C.bold}${C.cyan}  Migrating from OpenClaw${C.reset}\n`);

    if (!fs.existsSync(openclawDir)) {
        console.error(`${C.red}  Error: ~/.openclaw/ not found${C.reset}\n`);
        return;
    }

    const found = { persona: '', memories: [], skills: [], apiKeys: {} };

    // Read SOUL.md for persona
    const soulPath = path.join(openclawDir, 'SOUL.md');
    if (fs.existsSync(soulPath)) {
        found.persona = fs.readFileSync(soulPath, 'utf-8').trim();
    }

    // Read MEMORY.md for memories
    const memoryPath = path.join(openclawDir, 'MEMORY.md');
    if (fs.existsSync(memoryPath)) {
        const raw = fs.readFileSync(memoryPath, 'utf-8');
        // Parse line-by-line: each non-empty line or markdown list item is a memory
        const lines = raw.split('\n')
            .map(l => l.replace(/^[-*]\s+/, '').trim())
            .filter(l => l.length > 2 && !l.startsWith('#'));
        found.memories = lines;
    }

    // Read config for API keys
    const configFiles = ['config.json', 'config.yaml', '.env'];
    for (const cf of configFiles) {
        const cfPath = path.join(openclawDir, cf);
        if (!fs.existsSync(cfPath)) continue;
        const raw = fs.readFileSync(cfPath, 'utf-8');

        if (cf.endsWith('.json')) {
            try {
                const data = JSON.parse(raw);
                for (const [k, v] of Object.entries(data)) {
                    if (typeof v === 'string' && (k.toLowerCase().includes('key') || k.toLowerCase().includes('token'))) {
                        found.apiKeys[k] = v;
                    }
                }
            } catch { /* skip */ }
        } else {
            // Parse KEY=VALUE lines (.env / yaml simple)
            const lines = raw.split('\n');
            for (const line of lines) {
                const match = line.match(/^([A-Z_a-z]+)\s*[=:]\s*(.+)$/);
                if (match) {
                    const [, key, val] = match;
                    if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
                        found.apiKeys[key] = val.trim().replace(/^["']|["']$/g, '');
                    }
                }
            }
        }
    }

    // Read skills directory
    const skillsDir = path.join(openclawDir, 'skills');
    if (fs.existsSync(skillsDir)) {
        found.skills = fs.readdirSync(skillsDir);
    }

    // Report
    console.log(`  ${C.gray}Found:${C.reset}`);
    console.log(`    ${C.dim}Persona (SOUL.md):${C.reset} ${found.persona ? `${found.persona.slice(0, 60)}...` : 'none'}`);
    console.log(`    ${C.dim}Memories:${C.reset}          ${found.memories.length}`);
    console.log(`    ${C.dim}API Keys:${C.reset}          ${Object.keys(found.apiKeys).length}`);
    console.log(`    ${C.dim}Skills:${C.reset}            ${found.skills.length}`);
    console.log();

    if (dryRun) {
        console.log(`  ${C.yellow}DRY RUN — no changes made.${C.reset}\n`);
        return;
    }

    // Write memories
    const memoriesDir = path.join(skalesDataDir, 'memories');
    if (!fs.existsSync(memoriesDir)) fs.mkdirSync(memoriesDir, { recursive: true });

    let imported = 0;
    for (const mem of found.memories) {
        const id = `mem_openclaw_${Date.now()}_${imported}`;
        const entry = {
            id,
            category: 'fact',
            content: mem,
            source_conversation_id: 'openclaw-migration',
            extracted_at: Date.now(),
            relevance_keywords: [],
        };
        fs.writeFileSync(path.join(memoriesDir, `${id}.json`), JSON.stringify(entry, null, 2));
        imported++;
    }

    // Write persona as system prompt
    if (found.persona) {
        const settingsPath = path.join(skalesDataDir, 'settings.json');
        let settings = {};
        try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { /* new */ }
        settings.systemPrompt = found.persona;

        // Map API keys
        for (const [key, val] of Object.entries(found.apiKeys)) {
            if (!settings.providers) continue;
            const kl = key.toLowerCase();
            if (kl.includes('openrouter') && settings.providers.openrouter) settings.providers.openrouter.apiKey = val;
            else if (kl.includes('openai') && settings.providers.openai) settings.providers.openai.apiKey = val;
            else if (kl.includes('anthropic') && settings.providers.anthropic) settings.providers.anthropic.apiKey = val;
            else if (kl.includes('google') && settings.providers.google) settings.providers.google.apiKey = val;
        }

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }

    console.log(`  ${C.green}✓ Imported ${imported} memories${C.reset}`);
    if (found.persona) console.log(`  ${C.green}✓ Set persona from SOUL.md${C.reset}`);
    console.log(`  ${C.dim}Source files NOT deleted.${C.reset}\n`);
}

// ─── MCP Commands ───────────────────────────────────────────

function printMcpUsage() {
    console.log(`\n${C.bold}${C.cyan}  MCP (Model Context Protocol)${C.reset}\n`);
    console.log(`  ${C.bold}Usage:${C.reset}`);
    console.log(`    skales mcp                        ${C.dim}List configured MCP servers${C.reset}`);
    console.log(`    skales mcp list                   ${C.dim}Same as above${C.reset}`);
    console.log(`    skales mcp test <name>            ${C.dim}Live connection check${C.reset}`);
    console.log(`    skales mcp add <config.json>      ${C.dim}Add server from JSON file${C.reset}`);
    console.log(`    skales mcp remove <name>          ${C.dim}Remove an MCP server${C.reset}`);
    console.log(`    skales mcp logs <name> [--lines N] ${C.dim}Show recent server logs${C.reset}`);
    console.log();
}

function mcpUnavailable() {
    console.error(`${C.red}  MCP endpoints not yet available in this Skales Desktop version.${C.reset}`);
    console.error(`${C.dim}  Requires v10.0.3 or later with MCP management backend.${C.reset}\n`);
}

async function cmdMcp(args) {
    const sub = args[0] || 'list';

    if (sub === 'help' || sub === '--help' || sub === '-h') {
        printMcpUsage();
        return;
    }

    try {
        if (sub === 'list') {
            const { status, data } = await request('GET', '/api/cli/mcp');
            if (status === 404) { mcpUnavailable(); return; }
            if (status !== 200) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            const servers = (data && data.servers) || [];
            console.log(`\n${C.bold}${C.cyan}  MCP Servers (${servers.length})${C.reset}\n`);
            if (servers.length === 0) {
                console.log(`  ${C.dim}No MCP servers configured. See docs/mcp-servers.md to add one.${C.reset}\n`);
                return;
            }
            for (const s of servers) {
                const icon = s.status === 'connected' ? `${C.green}●${C.reset}`
                    : s.status === 'disabled' ? `${C.gray}○${C.reset}`
                    : `${C.red}✗${C.reset}`;
                const tools = typeof s.tools === 'number' ? `${s.tools} tools` : '';
                console.log(`  ${icon} ${C.bold}${s.name}${C.reset} ${C.dim}(${s.transport || 'stdio'})${C.reset}`);
                console.log(`    ${C.dim}status: ${s.status} ${tools ? '| ' + tools : ''} | enabled: ${s.enabled !== false}${C.reset}`);
            }
            console.log();
            return;
        }

        if (sub === 'test') {
            const name = args[1];
            if (!name) {
                console.error(`${C.red}Usage: skales mcp test <name>${C.reset}\n`);
                return;
            }
            const { status, data } = await request('POST', '/api/cli/mcp/test', { name });
            if (status === 404) { mcpUnavailable(); return; }
            if (status !== 200) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            if (data && data.ok) {
                console.log(`${C.green}  ✓ ${name}${C.reset} ${C.dim}connected in ${data.latency_ms}ms, ${data.tools} tools${C.reset}\n`);
            } else {
                console.error(`${C.red}  ✗ ${name}${C.reset} ${C.dim}${(data && data.error) || 'connection failed'}${C.reset}\n`);
            }
            return;
        }

        if (sub === 'add') {
            const configFile = args[1];
            if (!configFile) {
                console.error(`${C.red}Usage: skales mcp add <config.json>${C.reset}\n`);
                return;
            }
            if (!fs.existsSync(configFile)) {
                console.error(`${C.red}Error: File not found: ${configFile}${C.reset}\n`);
                return;
            }
            let payload;
            try {
                payload = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            } catch (err) {
                console.error(`${C.red}Error: Invalid JSON in ${configFile}: ${err.message}${C.reset}\n`);
                return;
            }
            const { status, data } = await request('POST', '/api/cli/mcp', payload);
            if (status === 404) { mcpUnavailable(); return; }
            if (status !== 200 && status !== 201) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`${C.green}  ✓ Added MCP server: ${payload.name || '(unnamed)'}${C.reset}\n`);
            return;
        }

        if (sub === 'remove') {
            const name = args[1];
            if (!name) {
                console.error(`${C.red}Usage: skales mcp remove <name>${C.reset}\n`);
                return;
            }
            const { status, data } = await request('DELETE', `/api/cli/mcp/${encodeURIComponent(name)}`);
            if (status === 404) {
                // Distinguish "endpoint missing" from "server not found"
                if (data && typeof data === 'object' && data.error) {
                    console.error(`${C.red}Error: ${data.error}${C.reset}\n`);
                } else {
                    mcpUnavailable();
                }
                return;
            }
            if (status !== 200) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`${C.green}  ✓ Removed MCP server: ${name}${C.reset}\n`);
            return;
        }

        if (sub === 'logs') {
            const name = args[1];
            if (!name) {
                console.error(`${C.red}Usage: skales mcp logs <name> [--lines N]${C.reset}\n`);
                return;
            }
            let lines = 100;
            for (let i = 2; i < args.length; i++) {
                if (args[i] === '--lines' && args[i + 1]) {
                    const n = parseInt(args[++i], 10);
                    if (!isNaN(n) && n > 0) lines = n;
                }
            }
            const { status, data } = await request('GET', `/api/cli/mcp/${encodeURIComponent(name)}/logs?lines=${lines}`);
            if (status === 404) { mcpUnavailable(); return; }
            if (status !== 200) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            const logLines = (data && data.lines) || [];
            console.log(`\n${C.bold}${C.cyan}  Logs for ${name} (${logLines.length} lines)${C.reset}\n`);
            for (const ln of logLines) {
                const color = ln.stream === 'stderr' ? C.yellow : C.gray;
                const ts = ln.t ? `${C.dim}${ln.t}${C.reset} ` : '';
                console.log(`  ${ts}${color}[${ln.stream || 'stdout'}]${C.reset} ${ln.msg || ''}`);
            }
            console.log();
            return;
        }

        console.error(`${C.red}Unknown mcp subcommand: ${sub}${C.reset}`);
        printMcpUsage();
    } catch (err) {
        console.error(`${C.red}Error: ${err.message}${C.reset}`);
        console.error(`${C.dim}Is Skales running on ${BASE_URL}?${C.reset}`);
    }
}

// ─── Cron Commands ──────────────────────────────────────────

function printCronUsage() {
    console.log(`\n${C.bold}${C.cyan}  Scheduled Tasks (cron)${C.reset}\n`);
    console.log(`  ${C.bold}Usage:${C.reset}`);
    console.log(`    skales cron                               ${C.dim}List scheduled tasks${C.reset}`);
    console.log(`    skales cron list                          ${C.dim}Same as above${C.reset}`);
    console.log(`    skales cron add <id> "<schedule>" "<prompt>"  ${C.dim}Add a task${C.reset}`);
    console.log(`    skales cron remove <id>                   ${C.dim}Delete a task${C.reset}`);
    console.log(`    skales cron enable <id>                   ${C.dim}Enable a task${C.reset}`);
    console.log(`    skales cron disable <id>                  ${C.dim}Pause a task${C.reset}`);
    console.log(`    skales cron run <id>                      ${C.dim}Fire a task immediately${C.reset}`);
    console.log();
    console.log(`  ${C.bold}Schedule:${C.reset} 5-field cron (minute hour day month weekday)`);
    console.log(`  ${C.dim}  "0 9 * * *"      daily at 9am${C.reset}`);
    console.log(`  ${C.dim}  "*/15 * * * *"   every 15 minutes${C.reset}`);
    console.log();
}

function cronUnavailable(detail) {
    console.error(`${C.red}  Scheduled task endpoint not available in this Skales Desktop version.${C.reset}`);
    if (detail) console.error(`${C.dim}  ${detail}${C.reset}`);
    console.error(`${C.dim}  Requires v10.0.3 or later (or v10.1+ for 'run').${C.reset}\n`);
}

async function cmdCron(args) {
    const sub = args[0] || 'list';

    if (sub === 'help' || sub === '--help' || sub === '-h') {
        printCronUsage();
        return;
    }

    try {
        if (sub === 'list') {
            const { status, data } = await request('GET', '/api/cli/cron');
            if (status === 404) { cronUnavailable(); return; }
            if (status !== 200) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            const tasks = (data && data.tasks) || [];
            console.log(`\n${C.bold}${C.cyan}  Scheduled Tasks (${tasks.length})${C.reset}\n`);
            if (tasks.length === 0) {
                console.log(`  ${C.dim}No scheduled tasks. Use 'skales cron add' to create one.${C.reset}\n`);
                return;
            }
            for (const t of tasks) {
                const icon = t.enabled === false ? `${C.gray}○${C.reset}` : `${C.green}●${C.reset}`;
                const nextRun = t.next_run || t.nextRun;
                const lastRun = t.last_run || t.lastRun;
                console.log(`  ${icon} ${C.bold}${t.id || t.name}${C.reset} ${C.dim}${t.schedule}${C.reset}`);
                const body = t.prompt || t.task || t.name || '';
                if (body) console.log(`    ${C.dim}${String(body).slice(0, 120)}${C.reset}`);
                if (nextRun) console.log(`    ${C.dim}next: ${nextRun}${C.reset}`);
                if (lastRun) console.log(`    ${C.dim}last: ${lastRun}${C.reset}`);
                console.log();
            }
            return;
        }

        if (sub === 'add') {
            const [id, schedule, prompt] = [args[1], args[2], args.slice(3).join(' ')];
            if (!id || !schedule || !prompt) {
                console.error(`${C.red}Usage: skales cron add <id> "<schedule>" "<prompt>"${C.reset}\n`);
                return;
            }
            const { status, data } = await request('POST', '/api/cli/cron', { id, schedule, prompt });
            if (status === 404) { cronUnavailable(); return; }
            if (status !== 200 && status !== 201) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`${C.green}  ✓ Added task: ${id}${C.reset} ${C.dim}(${schedule})${C.reset}\n`);
            return;
        }

        if (sub === 'remove') {
            const id = args[1];
            if (!id) {
                console.error(`${C.red}Usage: skales cron remove <id>${C.reset}\n`);
                return;
            }
            // Support both path-style and query-style DELETE depending on backend version
            let res = await request('DELETE', `/api/cli/cron/${encodeURIComponent(id)}`);
            if (res.status === 404) {
                res = await request('DELETE', `/api/cli/cron?id=${encodeURIComponent(id)}`);
            }
            if (res.status === 404) { cronUnavailable(); return; }
            if (res.status !== 200) {
                console.error(`${C.red}Error: ${(res.data && res.data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`${C.green}  ✓ Removed task: ${id}${C.reset}\n`);
            return;
        }

        if (sub === 'enable' || sub === 'disable') {
            const id = args[1];
            if (!id) {
                console.error(`${C.red}Usage: skales cron ${sub} <id>${C.reset}\n`);
                return;
            }
            const enabled = sub === 'enable';
            const { status, data } = await request('PATCH', `/api/cli/cron/${encodeURIComponent(id)}`, { enabled });
            if (status === 404) { cronUnavailable('PATCH /api/cli/cron/{id} not implemented yet.'); return; }
            if (status !== 200) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`${C.green}  ✓ ${enabled ? 'Enabled' : 'Disabled'} task: ${id}${C.reset}\n`);
            return;
        }

        if (sub === 'run') {
            const id = args[1];
            if (!id) {
                console.error(`${C.red}Usage: skales cron run <id>${C.reset}\n`);
                return;
            }
            const { status, data } = await request('POST', `/api/cli/cron/${encodeURIComponent(id)}/run`);
            if (status === 404) { cronUnavailable('POST /api/cli/cron/{id}/run requires Desktop v10.1+.'); return; }
            if (status !== 200 && status !== 202) {
                console.error(`${C.red}Error: ${(data && data.error) || 'Unknown error'}${C.reset}`);
                return;
            }
            console.log(`${C.green}  ✓ Triggered task: ${id}${C.reset} ${C.dim}${(data && data.status) ? '(' + data.status + ')' : ''}${C.reset}\n`);
            return;
        }

        console.error(`${C.red}Unknown cron subcommand: ${sub}${C.reset}`);
        printCronUsage();
    } catch (err) {
        console.error(`${C.red}Error: ${err.message}${C.reset}`);
        console.error(`${C.dim}Is Skales running on ${BASE_URL}?${C.reset}`);
    }
}

// ─── Utilities ──────────────────────────────────────────────

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

function printHelp() {
    console.log(`
${C.bold}${C.cyan}  Skales DevKit CLI${C.reset} ${C.dim}v${CLI_VERSION}${C.reset}
${C.dim}  ────────────────────────────────────${C.reset}

  ${C.bold}Usage:${C.reset}
    node skales.js ${C.green}<command>${C.reset} [options]

  ${C.bold}Commands:${C.reset}
    ${C.green}chat${C.reset}                              Interactive chat session
    ${C.green}chat${C.reset} ${C.dim}"message"${C.reset}                   One-shot message (print & exit)
    ${C.green}tools${C.reset}                             List available tools
    ${C.green}model${C.reset}                             Show current provider/model
    ${C.green}model${C.reset} ${C.dim}<provider> <model>${C.reset}          Switch provider and model
    ${C.green}status${C.reset}                            System status
    ${C.green}memory${C.reset}                            List memory items
    ${C.green}sessions${C.reset}                          List chat sessions
    ${C.green}mcp${C.reset} ${C.dim}[list|test|add|remove|logs]${C.reset}   Manage MCP servers
    ${C.green}cron${C.reset} ${C.dim}[list|add|remove|enable|disable|run]${C.reset}  Manage scheduled tasks
    ${C.green}migrate${C.reset} --from ${C.dim}<hermes|openclaw>${C.reset}  Import from another agent
    ${C.green}migrate${C.reset} --dry-run                 Preview import without changes
    ${C.green}--version${C.reset}                         Print CLI version

  ${C.bold}Chat Commands (interactive mode):${C.reset}
    ${C.dim}/new${C.reset}      Start fresh session
    ${C.dim}/model${C.reset}    Show current model
    ${C.dim}/tools${C.reset}    List tools
    ${C.dim}/status${C.reset}   System info
    ${C.dim}/quit${C.reset}     Exit

  ${C.bold}Environment:${C.reset}
    ${C.dim}SKALES_URL${C.reset}   Base URL (default: http://localhost:3000)

  ${C.bold}Auth:${C.reset}
    Token is read from ${C.dim}../devkit.json${C.reset}
`);
}

// ─── Main ───────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0] || '';

switch (command) {
    case 'chat':
        cmdChat(args[1] || null);
        break;
    case 'tools':
        cmdTools();
        break;
    case 'model':
        cmdModel(args.slice(1));
        break;
    case 'status':
        cmdStatus();
        break;
    case 'memory':
        cmdMemory();
        break;
    case 'sessions':
        cmdSessions();
        break;
    case 'migrate':
        cmdMigrate(args.slice(1));
        break;
    case 'mcp':
        cmdMcp(args.slice(1));
        break;
    case 'cron':
        cmdCron(args.slice(1));
        break;
    case '--version':
    case '-v':
        console.log(CLI_VERSION);
        break;
    case 'help':
    case '--help':
    case '-h':
        printHelp();
        break;
    default:
        if (command) {
            console.error(`${C.red}Unknown command: ${command}${C.reset}`);
        }
        printHelp();
        break;
}
