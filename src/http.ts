#!/usr/bin/env node

import http from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createServer } from './index.js';
import { renderHomepage } from './homepage.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const mcpHandler = createMcpHandler(() => createServer(), {
  legacy: 'stateless',
});
const nodeMcpHandler = toNodeHandler(mcpHandler);

async function handleMcp(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  searchParams: URLSearchParams
) {
  const coincapApiKey =
    searchParams.get('COINCAP_API_KEY') ?? process.env.COINCAP_API_KEY;

  if (!coincapApiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error:
          'COINCAP_API_KEY is required. Pass it as a query parameter (?COINCAP_API_KEY=your_key) or set the COINCAP_API_KEY environment variable. Get your free API key at https://pro.coincap.io/dashboard',
      })
    );
    return;
  }

  process.env.COINCAP_API_KEY = coincapApiKey;
  await nodeMcpHandler(req, res);
}

const httpServer = http.createServer(async (req, res) => {
  const parsed = new URL(req.url ?? '/', `http://localhost`);
  const pathname = parsed.pathname;

  // Homepage: GET /
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHomepage());
    return;
  }

  // Health check: GET /health
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // MCP protocol: /mcp (POST/GET for SSE)
  if (pathname === '/mcp') {
    await handleMcp(req, res, parsed.searchParams);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

httpServer.listen(PORT, () => {
  console.log(`MCP HTTP server listening on port ${PORT}`);
});
