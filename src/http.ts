#!/usr/bin/env node

import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './index.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function handleMcp(req: http.IncomingMessage, res: http.ServerResponse) {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createServer({ config: { coincapApiKey: process.env.COINCAP_API_KEY } });
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

const httpServer = http.createServer(async (req, res) => {
  // Health check: GET / or GET /health
  if ((req.url === '/' || req.url === '/health') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // MCP protocol: /mcp or / (POST/GET for SSE)
  if (req.url === '/mcp' || req.url === '/') {
    await handleMcp(req, res);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

httpServer.listen(PORT, () => {
  console.log(`MCP HTTP server listening on port ${PORT}`);
});
