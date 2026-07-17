// InfiniteMirror MCP server: the orchestrator harness as MCP tools.
// Runs behind a Pomerium route with `mcp: server: {}` — Pomerium handles the
// OAuth flow for MCP clients (Claude etc.); this process never sees
// credentials, only Pomerium's identity headers. Stateless streamable HTTP.

const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { z } = require('zod');

const PORT = process.env.PORT || 3001;
const REPO_ROOT = path.join(__dirname, '..');
const PYTHON = path.join(REPO_ROOT, '.venv', 'bin', 'python');
const ORCH = path.join(REPO_ROOT, 'orchestrator', 'orchestrator.py');
const DASHBOARD = process.env.DASHBOARD_URL || 'http://127.0.0.1:3000';

function buildServer(identity) {
  const server = new McpServer({ name: 'infinitemirror', version: '0.1.0' });

  server.tool(
    'orchestrate',
    'Run a task through the InfiniteMirror skill-routing orchestrator. Work is delegated across skill-carded agents (research, code, analysis) reasoning on an Akash-hosted GPU; returns the answer plus per-hop routing decisions.',
    { task: z.string().describe('The task to orchestrate') },
    async ({ task }) => {
      console.log(`orchestrate [${identity}]: ${task.slice(0, 120)}`);
      const out = await new Promise((resolve, reject) => {
        execFile(PYTHON, [ORCH, '--json', task],
          { timeout: 180000, maxBuffer: 4 * 1024 * 1024 },
          (err, stdout, stderr) => err ? reject(new Error((stderr || err.message).slice(-400))) : resolve(stdout));
      });
      return { content: [{ type: 'text', text: out.trim().split('\n').pop() }] };
    }
  );

  server.tool(
    'worker_health',
    'Check health of the InfiniteMirror stack: dashboard uptime and Akash GPU worker reachability/latency.',
    {},
    async () => {
      const r = await fetch(`${DASHBOARD}/api/health`, { signal: AbortSignal.timeout(15000) });
      return { content: [{ type: 'text', text: await r.text() }] };
    }
  );

  return server;
}

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const identity = req.headers['x-pomerium-claim-email'] || 'unknown';
  try {
    const server = buildServer(identity);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    console.error('mcp error:', e.message);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'internal error' }, id: null });
    }
  }
});

app.get('/healthz', (req, res) => res.json({ ok: true, service: 'infinitemirror-mcp' }));

app.listen(PORT, () => console.log(`InfiniteMirror MCP server on :${PORT} (stateless streamable HTTP at /mcp)`));
