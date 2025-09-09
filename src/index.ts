#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { SERVER_CONFIG } from './config/index.js';
import {
  handleGetPrice,
  handleGetMarketAnalysis,
  handleGetHistoricalAnalysis,
  GetPriceArgumentsSchema,
  GetMarketAnalysisSchema,
  GetHistoricalAnalysisSchema,
} from './tools/index.js';

export const configSchema = z.object({
  coincapApiKey: z
    .string()
    .optional()
    .describe("Optional API key for CoinCap to increase rate limits"),
});

export default function createServer({
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
  });

  server.registerTool(
    "get-crypto-price",
    {
      title: "Get Crypto Price",
      description: "Get current price and 24h stats for a cryptocurrency",
      inputSchema: GetPriceArgumentsSchema.shape,
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
    },
    async (args, _extra) => {
      const result = await handleGetHistoricalAnalysis(args);
      return result as any;
    }
  );

  return server.server;
}

async function main() {
  const server = createServer({
    config: { coincapApiKey: process.env.COINCAP_API_KEY },
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Crypto Price MCP Server running on stdio");
}

// Only start the STDIO transport when explicitly requested.
// This prevents auto-starting during HTTP bundling/scanning.
if (process.env.MCP_TRANSPORT === "stdio") {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}