#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/spec.types.js';

import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SERVER_CONFIG } from './config/index.js';

import {
  handleGetPrice,
  handleGetMarketAnalysis,
  handleGetHistoricalAnalysis,
  handleGetTopAssets,
  handleGetTechnicalAnalysis,
  handleGetRates,
  handleGetExchanges,
  GetPriceArgumentsSchema,
  GetMarketAnalysisSchema,
  GetHistoricalAnalysisSchema,
  GetTopAssetsSchema,
  GetTechnicalAnalysisSchema,
  GetRatesSchema,
  GetExchangesSchema,
} from './tools/index.js';

export const configSchema = z.object({
  COINCAP_API_KEY: z
    .string()
    .optional()
    .describe(
      'API key for CoinCap v3 API. Free tier available at https://pro.coincap.io/dashboard'
    ),
  CACHE_TTL_SECONDS: z
    .number()
    .int()
    .min(10)
    .max(3600)
    .default(60)
    .optional()
    .describe(
      'How long to cache API responses in seconds (default: 60). Lower values return fresher data; higher values reduce API usage.'
    ),
});

export function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  if (config?.COINCAP_API_KEY && !process.env.COINCAP_API_KEY) {
    process.env.COINCAP_API_KEY = config.COINCAP_API_KEY;
  }
  if (config?.CACHE_TTL_SECONDS != null) {
    process.env.CACHE_TTL_SECONDS = String(config.CACHE_TTL_SECONDS);
  }

  const server = new McpServer({
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
    icons: [
      {
        src: 'https://raw.githubusercontent.com/truss44/mcp-crypto-price/main/logo.png',
        mimeType: 'image/png',
      },
    ],
  });

  server.registerTool(
    'get-crypto-price',
    {
      title: 'Get Crypto Price',
      description:
        'Get real-time price, 24-hour change percentage, trading volume, and market cap for any cryptocurrency by symbol or name.',
      inputSchema: GetPriceArgumentsSchema.shape,
      annotations: {
        title: 'Get Crypto Price',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetPrice(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'get-market-analysis',
    {
      title: 'Get Market Analysis',
      description:
        'Get detailed market analysis for a cryptocurrency including the top 5 exchanges by volume, price per exchange, and volume distribution percentages.',
      inputSchema: GetMarketAnalysisSchema.shape,
      annotations: {
        title: 'Get Market Analysis',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetMarketAnalysis(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'get-historical-analysis',
    {
      title: 'Get Historical Analysis',
      description:
        'Get historical price data for a cryptocurrency with trend analysis including period high/low, price change percentage, and volatility metrics over a customizable timeframe.',
      inputSchema: GetHistoricalAnalysisSchema.shape,
      annotations: {
        title: 'Get Historical Analysis',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetHistoricalAnalysis(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'get-top-assets',
    {
      title: 'Get Top Assets',
      description:
        'Get the top cryptocurrencies ranked by market cap, with real-time price, 24-hour change percentage, and market cap for each asset.',
      inputSchema: GetTopAssetsSchema.shape,
      annotations: {
        title: 'Get Top Assets',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetTopAssets(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'get-technical-analysis',
    {
      title: 'Get Technical Analysis',
      description:
        'Get the latest technical indicators for a cryptocurrency including SMA, EMA, RSI, MACD, and VWAP to assess momentum, trend direction, and overbought/oversold conditions.',
      inputSchema: GetTechnicalAnalysisSchema.shape,
      annotations: {
        title: 'Get Technical Analysis',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetTechnicalAnalysis(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'get-rates',
    {
      title: 'Get Currency Rates',
      description:
        "Get USD-based conversion rates for fiat currencies and cryptocurrencies. Optionally pass a slug (e.g. 'euro', 'us-dollar', 'bitcoin') to look up a single rate.",
      inputSchema: GetRatesSchema.shape,
      annotations: {
        title: 'Get Currency Rates',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetRates(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'get-exchanges',
    {
      title: 'Get Exchanges',
      description:
        "Get top cryptocurrency exchanges ranked by 24h volume. Optionally pass an exchangeId (e.g. 'binance', 'coinbase') to get details for a specific exchange including volume, trading pairs, and market share.",
      inputSchema: GetExchangesSchema.shape,
      annotations: {
        title: 'Get Exchanges',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetExchanges(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerPrompt(
    'analyze-crypto',
    {
      title: 'Analyze Cryptocurrency',
      description:
        'Generate a comprehensive analysis of a cryptocurrency covering price, market, and historical trends',
      argsSchema: {
        symbol: z
          .string()
          .describe('Cryptocurrency symbol or name (e.g. BTC, ETH, Bitcoin)'),
      },
    },
    ({ symbol }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please provide a comprehensive analysis of ${symbol}. Use the available tools to:
1. Get the current price and 24-hour stats
2. Analyze the top exchanges and trading volume distribution
3. Review historical price trends over the past 7 days

Summarize the findings including price performance, market liquidity, and any notable trends.`,
          },
        },
      ],
    })
  );

  // Register a no-op resource so the server advertises resources capability
  // during the MCP initialize handshake. Without this, clients may receive
  // -32601 "Method not found" errors for resources/list.
  server.registerResource(
    'server-info',
    'info://server',
    {
      title: 'Server Info',
      description: 'Basic server information',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            name: SERVER_CONFIG.name,
            version: SERVER_CONFIG.version,
          }),
        },
      ],
    })
  );

  return server.server;
}

export default createServer;

export function createSandboxServer() {
  return createServer({
    config: { COINCAP_API_KEY: undefined },
  });
}

async function main() {
  const server = createServer({
    config: { COINCAP_API_KEY: process.env.COINCAP_API_KEY },
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Crypto Price MCP Server running on stdio');
}

// Start stdio transport when:
// 1. Explicitly requested via MCP_TRANSPORT=stdio, OR
// 2. Run directly from CLI (not imported as a module)
let thisFilePath: string | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const importMetaUrl = (import.meta as any)?.url;
  if (typeof importMetaUrl === 'string') {
    thisFilePath = fileURLToPath(importMetaUrl);
  }
} catch {
  // no-op
}

const isEntrypoint =
  typeof thisFilePath === 'string' &&
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === path.resolve(thisFilePath);

const isDirectRun =
  isEntrypoint || process.argv[1]?.includes('mcp-crypto-price');

if (process.env.MCP_TRANSPORT === 'stdio' || isDirectRun) {
  main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
  });
}
