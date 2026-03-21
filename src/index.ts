#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { z } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SERVER_CONFIG } from './config/index.js';
import {
  handleGetPrice,
  handleGetMarketAnalysis,
  handleGetHistoricalAnalysis,
  handleGetTopAssets,
  GetPriceArgumentsSchema,
  GetMarketAnalysisSchema,
  GetHistoricalAnalysisSchema,
  GetTopAssetsSchema,
} from './tools/index.js';

export const configSchema = z.object({
  coincapApiKey: z
    .string()
    .optional()
    .describe("Optional API key for CoinCap to increase rate limits"),
});

export function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  if (config?.coincapApiKey && !process.env.COINCAP_API_KEY) {
    process.env.COINCAP_API_KEY = config.coincapApiKey;
  }

  const server = new McpServer({
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
    icons: [
      {
        src: "https://raw.githubusercontent.com/truss44/mcp-crypto-price/main/logo.png",
        mimeType: "image/png",
      },
    ],
  });

  server.registerTool(
    "get-crypto-price",
    {
      title: "Get Crypto Price",
      description: "Get current price and 24h stats for a cryptocurrency",
      inputSchema: GetPriceArgumentsSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args, _extra) => {
      const result = await handleGetPrice(args);
      return result as any;
    }
  );

  server.registerTool(
    "get-market-analysis",
    {
      title: "Get Market Analysis",
      description:
        "Get detailed market analysis including top exchanges and volume distribution",
      inputSchema: GetMarketAnalysisSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args, _extra) => {
      const result = await handleGetMarketAnalysis(args);
      return result as any;
    }
  );

  server.registerTool(
    "get-historical-analysis",
    {
      title: "Get Historical Analysis",
      description:
        "Get historical price analysis with customizable timeframe",
      inputSchema: GetHistoricalAnalysisSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args, _extra) => {
      const result = await handleGetHistoricalAnalysis(args);
      return result as any;
    }
  );

  server.registerTool(
    "get-top-assets",
    {
      title: "Get Top Assets",
      description:
        "Get top cryptocurrencies ranked by market cap",
      inputSchema: GetTopAssetsSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args, _extra) => {
      const result = await handleGetTopAssets(args);
      return result as any;
    }
  );

  server.registerPrompt(
    "analyze-crypto",
    {
      title: "Analyze Cryptocurrency",
      description:
        "Generate a comprehensive analysis of a cryptocurrency covering price, market, and historical trends",
      argsSchema: {
        symbol: z.string().describe("Cryptocurrency symbol or name (e.g. BTC, ETH, Bitcoin)"),
      },
    },
    ({ symbol }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
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
    "server-info",
    "info://server",
    {
      title: "Server Info",
      description: "Basic server information",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
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
    config: { coincapApiKey: undefined },
  });
}

async function main() {
  const server = createServer({
    config: { coincapApiKey: process.env.COINCAP_API_KEY },
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Crypto Price MCP Server running on stdio");
}

// Start stdio transport when:
// 1. Explicitly requested via MCP_TRANSPORT=stdio, OR
// 2. Run directly from CLI (not imported as a module)
let thisFilePath: string | undefined;
try {
  const importMetaUrl = (import.meta as any)?.url;
  if (typeof importMetaUrl === "string") {
    thisFilePath = fileURLToPath(importMetaUrl);
  }
} catch {
  // no-op
}

const isEntrypoint =
  typeof thisFilePath === "string" &&
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === path.resolve(thisFilePath);

const isDirectRun = isEntrypoint || process.argv[1]?.includes('mcp-crypto-price');

if (process.env.MCP_TRANSPORT === "stdio" || isDirectRun) {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}