#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { SERVER_CONFIG } from './config/index.js';
import { handleGetPrice, handleGetMarketAnalysis, handleGetHistoricalAnalysis } from './tools/index.js';
// Create server instance
const server = new Server(SERVER_CONFIG, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get-crypto-price",
                description: "Get current price and 24h stats for a cryptocurrency",
                inputSchema: {
                    type: "object",
                    properties: {
                        symbol: {
                            type: "string",
                            description: "Cryptocurrency symbol (e.g., BTC, ETH)",
                        },
                    },
                    required: ["symbol"],
                },
            },
            {
                name: "get-market-analysis",
                description: "Get detailed market analysis including top exchanges and volume distribution",
                inputSchema: {
                    type: "object",
                    properties: {
                        symbol: {
                            type: "string",
                            description: "Cryptocurrency symbol (e.g., BTC, ETH)",
                        },
                    },
                    required: ["symbol"],
                },
            },
            {
                name: "get-historical-analysis",
                description: "Get historical price analysis with customizable timeframe",
                inputSchema: {
                    type: "object",
                    properties: {
                        symbol: {
                            type: "string",
                            description: "Cryptocurrency symbol (e.g., BTC, ETH)",
                        },
                        interval: {
                            type: "string",
                            description: "Time interval (m5, m15, m30, h1, h2, h6, h12, d1)",
                            default: "h1",
                        },
                        days: {
                            type: "number",
                            description: "Number of days to analyze (1-30)",
                            default: 7,
                        },
                    },
                    required: ["symbol"],
                },
            },
        ],
    };
});
// Handle execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "get-crypto-price":
                return await handleGetPrice(args);
            case "get-market-analysis":
                return await handleGetMarketAnalysis(args);
            case "get-historical-analysis":
                return await handleGetHistoricalAnalysis(args);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Tool execution failed: ${error.message}`);
        }
        throw error;
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Crypto Price MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
