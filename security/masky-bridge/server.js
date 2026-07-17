// Masky bridge: wraps the stdio `masky-mcp-server` as a streamable-HTTP MCP server,
// so Pomerium (an HTTP identity-aware proxy) can sit in front of it.
//
//   agent -> Pomerium (auth + per-tool policy) -> THIS bridge (:8080/mcp) -> masky (stdio)
//
// The bridge enforces two things on top of transport translation:
//   * ALLOWLIST  — only the converse+speak tools are exposed (see scope.js)
//   * pinArgs()  — every avatar-targeting argument is forced onto Nick
//
// The MASKY_API_KEY lives ONLY in this process's environment. It is never exposed to the
// agent or returned in any response. Bind is 127.0.0.1 by default — Pomerium is the only
// public door. Run: `npm start` (loads ../../.env for MASKY_API_KEY).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import express from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { ALLOWLIST, pinArgs, NICK } from "./scope.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Minimal, dependency-free .env loader (repo root) ---------------------------------------
function loadEnv() {
  if (process.env.MASKY_API_KEY) return; // already provided by the shell / container
  try {
    const envPath = resolve(__dirname, "../../.env");
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* fall through — validated below */ }
}
loadEnv();

if (!process.env.MASKY_API_KEY) {
  console.error("FATAL: MASKY_API_KEY not set (env or ../../.env). Refusing to start.");
  process.exit(1);
}

const PORT = Number(process.env.BRIDGE_PORT || 8080);
const HOST = process.env.BRIDGE_HOST || "127.0.0.1"; // internal-only; Pomerium fronts it

// --- Upstream: one long-lived MCP client over stdio to masky --------------------------------
const upstream = new Client({ name: "masky-bridge", version: "0.1.0" });
const upstreamTransport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "masky-mcp-server"],
  env: { ...process.env, MASKY_API_KEY: process.env.MASKY_API_KEY },
});

const audit = (event, detail) =>
  console.log(JSON.stringify({ ts: Date.now(), event, ...detail }));

// --- Build a scoped MCP server that proxies to the upstream ---------------------------------
function buildScopedServer() {
  const server = new Server(
    { name: "masky-bridge", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  // tools/list — expose ONLY allowlisted tools.
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const { tools } = await upstream.listTools();
    const scoped = tools.filter((t) => ALLOWLIST.has(t.name));
    return { tools: scoped };
  });

  // tools/call — allowlist gate + argument pinning, then forward upstream.
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: rawArgs } = req.params;

    if (!ALLOWLIST.has(name)) {
      audit("tool_denied", { tool: name, reason: "not_in_allowlist" });
      return {
        isError: true,
        content: [{ type: "text", text: `Tool '${name}' is not permitted for this agent.` }],
      };
    }

    let args;
    try {
      args = pinArgs(name, rawArgs);
    } catch (e) {
      audit("tool_denied", { tool: name, reason: "pin_rejected", message: String(e.message) });
      return { isError: true, content: [{ type: "text", text: String(e.message) }] };
    }

    audit("tool_call", { tool: name, pinnedAvatar: NICK.avatarId });
    const result = await upstream.callTool({ name, arguments: args });
    return result;
  });

  return server;
}

// --- HTTP layer (session-based streamable-HTTP) ---------------------------------------------
// Real MCP clients (Claude, etc.) initialize a session (POST), then open a notification
// stream (GET) and terminate it (DELETE) using the returned Mcp-Session-Id. We keep one
// scoped server + transport per session so GET/DELETE are valid, not 405.
const app = express();
app.use(express.json({ limit: "8mb" }));

app.get("/healthz", (_req, res) => res.json({ ok: true, pinnedAvatar: NICK.displayName }));

const transports = {}; // sessionId -> StreamableHTTPServerTransport

app.post("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"];
    let transport = sessionId ? transports[sessionId] : undefined;

    if (!transport && isInitializeRequest(req.body)) {
      // New session: spin up a fresh scoped server bound to a new transport.
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => { transports[sid] = transport; },
      });
      transport.onclose = () => {
        if (transport.sessionId) delete transports[transport.sessionId];
      };
      const server = buildScopedServer();
      await server.connect(transport);
    } else if (!transport) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "No valid session ID; initialize first" },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    audit("http_error", { message: String(err?.message || err) });
    if (!res.headersSent) res.status(500).json({ error: "bridge error" });
  }
});

// GET = open the SSE notification stream; DELETE = terminate the session.
const handleSessionRequest = async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessionId ? transports[sessionId] : undefined;
  if (!transport) {
    res.status(400).json({ error: "Invalid or missing Mcp-Session-Id" });
    return;
  }
  await transport.handleRequest(req, res);
};
app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

// --- Boot -----------------------------------------------------------------------------------
await upstream.connect(upstreamTransport);
audit("upstream_connected", { pinnedAvatar: NICK.displayName, allowlist: [...ALLOWLIST] });

app.listen(PORT, HOST, () => {
  audit("bridge_listening", { url: `http://${HOST}:${PORT}/mcp` });
});
