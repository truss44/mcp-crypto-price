#!/usr/bin/env node

import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './index.js';
import { SERVER_CONFIG } from './config/index.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function handleMcp(req: http.IncomingMessage, res: http.ServerResponse, searchParams: URLSearchParams) {
  const coincapApiKey = searchParams.get('coincapApiKey') ?? process.env.COINCAP_API_KEY;
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createServer({ config: { coincapApiKey } });
  await server.connect(transport);

  if (req.method === 'POST') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    await transport.handleRequest(req, res, body);
  } else {
    await transport.handleRequest(req, res);
  }
}

const serverCard = {
  serverInfo: {
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
  },
  tools: [
    {
      name: 'get-crypto-price',
      description: 'Get current price and 24h stats for a cryptocurrency',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)' },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'get-market-analysis',
      description: 'Get detailed market analysis including top exchanges and volume distribution',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)' },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'get-historical-analysis',
      description: 'Get historical price analysis with customizable timeframe',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)' },
          interval: { type: 'string', enum: ['m5', 'm15', 'm30', 'h1', 'h2', 'h6', 'h12', 'd1'], default: 'h1' },
          days: { type: 'number', minimum: 1, maximum: 30, default: 7 },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'get-top-assets',
      description: 'Get top cryptocurrencies ranked by market cap',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 },
        },
      },
    },
  ],
  resources: [
    {
      name: 'server-info',
      uri: 'info://server',
      description: 'Basic server information',
      mimeType: 'application/json',
    },
  ],
  prompts: [
    {
      name: 'analyze-crypto',
      description: 'Generate a comprehensive analysis of a cryptocurrency covering price, market, and historical trends',
    },
  ],
};

const httpServer = http.createServer(async (req, res) => {
  const parsed = new URL(req.url ?? '/', `http://localhost`);
  const pathname = parsed.pathname;

  // MCP server card for discovery (required by Smithery)
  if (pathname === '/.well-known/mcp/server-card.json' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(serverCard));
    return;
  }

  // Health check: GET / or GET /health
  if ((pathname === '/' || pathname === '/health') && req.method === 'GET') {
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
