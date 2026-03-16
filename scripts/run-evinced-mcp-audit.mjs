/**
 * Drives the @evinced/evinced-mcp-server over stdio using the MCP JSON-RPC protocol.
 * Calls the analyze_page tool for each page URL and saves results to JSON.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { label: 'Home Page',               url: 'http://localhost:3000/' },
  { label: 'Shop/New Page',           url: 'http://localhost:3000/shop/new' },
  { label: 'Product Detail Page',     url: 'http://localhost:3000/product/1' },
];

const SERVER_PATH = path.join(__dirname, '../node_modules/@evinced/evinced-mcp-server/dist/server.js');

function sendMessage(proc, msg) {
  const json = JSON.stringify(msg);
  proc.stdin.write(json + '\n');
}

async function callMcpTool(proc, rl, id, toolName, args) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timeout calling ${toolName}`)), 120000);

    const handler = (line) => {
      if (!line.trim()) return;
      try {
        const msg = JSON.parse(line);
        if (msg.id === id) {
          rl.off('line', handler);
          clearTimeout(timeout);
          resolve(msg);
        }
      } catch (_) {}
    };
    rl.on('line', handler);

    sendMessage(proc, {
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    });
  });
}

async function main() {
  console.log('Starting Evinced MCP server...');

  const proc = spawn(process.execPath, [SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      EVINCED_SERVICE_ID: '922eff48-df42-cd03-0d83-8f1b7efc2f5a',
      EVINCED_API_KEY: 'dLLkcxp0gVIh90XlCsmLQs3Zo6Pp4Oz7',
    },
  });

  proc.stderr.on('data', (d) => process.stderr.write(`[mcp-stderr] ${d}`));

  const rl = createInterface({ input: proc.stdout });

  // Initialize the MCP session
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Init timeout')), 15000);
    const handler = (line) => {
      if (!line.trim()) return;
      try {
        const msg = JSON.parse(line);
        if (msg.id === 1) {
          rl.off('line', handler);
          clearTimeout(timeout);
          console.log('MCP server initialized:', msg.result?.serverInfo?.name, msg.result?.serverInfo?.version);
          resolve();
        }
      } catch (_) {}
    };
    rl.on('line', handler);
    sendMessage(proc, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'cursor-cloud-agent', version: '1.0.0' },
      },
    });
  });

  // List available tools
  const toolsResp = await callMcpTool(proc, rl, 2, 'tools/list', {});
  console.log('\nAvailable tools:', toolsResp?.result?.tools?.map(t => t.name) ?? 'unknown');

  const results = [];

  let msgId = 10;
  for (const page of PAGES) {
    console.log(`\nAnalyzing: ${page.label} (${page.url})`);
    try {
      const resp = await callMcpTool(proc, rl, msgId++, 'analyze_page', { url: page.url });
      const raw = resp?.result?.content?.[0]?.text ?? '{}';
      const data = JSON.parse(raw);
      results.push({ page: page.label, url: page.url, data });
      const issueCount = Array.isArray(data) ? data.length : (data.issues?.length ?? 'unknown');
      console.log(`  Issues found: ${issueCount}`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
      results.push({ page: page.label, url: page.url, error: err.message });
    }
  }

  proc.kill();

  const outDir = path.join(__dirname, '../tests/e2e/test-results');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'evinced-mcp-audit.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outPath}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
