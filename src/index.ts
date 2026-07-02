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
  handleSearchAssets,
  handleGetGlobalMetrics,
  handleCompareCrypto,
  handleGetCandlestickData,
  handleGetPriceConversion,
  handleGetAssetInfo,
  GetPriceArgumentsSchema,
  GetMarketAnalysisSchema,
  GetHistoricalAnalysisSchema,
  GetTopAssetsSchema,
  GetTechnicalAnalysisSchema,
  GetRatesSchema,
  GetExchangesSchema,
  SearchAssetsSchema,
  GetGlobalMetricsSchema,
  CompareCryptoSchema,
  GetCandlestickDataSchema,
  GetPriceConversionSchema,
  GetAssetInfoSchema,
  PriceOutputSchema,
  MarketAnalysisOutputSchema,
  HistoricalAnalysisOutputSchema,
  TopAssetsOutputSchema,
  TechnicalAnalysisOutputSchema,
  RatesOutputSchema,
  ExchangesOutputSchema,
  SearchAssetsOutputSchema,
  GlobalMetricsOutputSchema,
  CompareOutputSchema,
  CandlestickOutputSchema,
  PriceConversionOutputSchema,
  AssetInfoOutputSchema,
} from './tools/index.js';

export const configSchema = z.object({
  COINCAP_API_KEY: z
    .string()
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
  if (config.COINCAP_API_KEY) {
    process.env.COINCAP_API_KEY = config.COINCAP_API_KEY;
  }
  if (config?.CACHE_TTL_SECONDS != null) {
    process.env.CACHE_TTL_SECONDS = String(config.CACHE_TTL_SECONDS);
  }

  const server = new McpServer({
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
    description:
      'A Model Context Protocol server providing cryptocurrency price, market, and on-chain data from CoinCap.',
    icons: [
      {
        src: 'https://raw.githubusercontent.com/truss44/mcp-crypto-price/main/logo.png',
        mimeType: 'image/png',
      },
    ],
  });

  server.registerTool(
    'price-get',
    {
      title: 'Get Crypto Price',
      description:
        'Get real-time price, 24-hour change percentage, trading volume, and market cap for any cryptocurrency by symbol or name.',
      inputSchema: GetPriceArgumentsSchema.shape,
      outputSchema: PriceOutputSchema.shape,
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
    'market-analysis',
    {
      title: 'Get Market Analysis',
      description:
        'Get detailed market analysis for a cryptocurrency including the top 5 exchanges by volume, price per exchange, and volume distribution percentages.',
      inputSchema: GetMarketAnalysisSchema.shape,
      outputSchema: MarketAnalysisOutputSchema.shape,
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
    'analysis-historical',
    {
      title: 'Get Historical Analysis',
      description:
        'Get historical price data for a cryptocurrency with trend analysis including period high/low, price change percentage, and volatility metrics over a customizable timeframe.',
      inputSchema: GetHistoricalAnalysisSchema.shape,
      outputSchema: HistoricalAnalysisOutputSchema.shape,
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
    'assets-top',
    {
      title: 'Get Top Assets',
      description:
        'Get the top cryptocurrencies ranked by market cap, with real-time price, 24-hour change percentage, and market cap for each asset.',
      inputSchema: GetTopAssetsSchema.shape,
      outputSchema: TopAssetsOutputSchema.shape,
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
    'analysis-technical',
    {
      title: 'Get Technical Analysis',
      description:
        'Get the latest technical indicators for a cryptocurrency including SMA, EMA, RSI, MACD, and VWAP to assess momentum, trend direction, and overbought/oversold conditions.',
      inputSchema: GetTechnicalAnalysisSchema.shape,
      outputSchema: TechnicalAnalysisOutputSchema.shape,
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
    'market-rates',
    {
      title: 'Get Currency Rates',
      description:
        "Get USD-based conversion rates for fiat currencies and cryptocurrencies. Optionally pass a slug (e.g. 'euro', 'us-dollar', 'bitcoin') to look up a single rate.",
      inputSchema: GetRatesSchema.shape,
      outputSchema: RatesOutputSchema.shape,
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
    'market-exchanges',
    {
      title: 'Get Exchanges',
      description:
        "Get top cryptocurrency exchanges ranked by 24h volume. Optionally pass an exchangeId (e.g. 'binance', 'coinbase') to get details for a specific exchange including volume, trading pairs, and market share.",
      inputSchema: GetExchangesSchema.shape,
      outputSchema: ExchangesOutputSchema.shape,
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

  server.registerTool(
    'assets-search',
    {
      title: 'Search Crypto Assets',
      description:
        'Search for cryptocurrencies by name, symbol, or partial match. Returns multiple matching assets with their ID, name, symbol, rank, and current price.',
      inputSchema: SearchAssetsSchema.shape,
      outputSchema: SearchAssetsOutputSchema.shape,
      annotations: {
        title: 'Search Crypto Assets',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleSearchAssets(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'market-global',
    {
      title: 'Get Global Metrics',
      description:
        'Get a global overview of the cryptocurrency market including total market capitalization, 24-hour trading volume, Bitcoin dominance percentage, and the number of active cryptocurrencies.',
      inputSchema: GetGlobalMetricsSchema.shape,
      outputSchema: GlobalMetricsOutputSchema.shape,
      annotations: {
        title: 'Get Global Metrics',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetGlobalMetrics(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'assets-compare',
    {
      title: 'Compare Cryptocurrencies',
      description:
        'Compare 2-5 cryptocurrencies side-by-side including price, 24h change, volume, market cap, and rank. Pass symbols as a comma-separated list (e.g. "BTC,ETH,SOL").',
      inputSchema: CompareCryptoSchema.shape,
      outputSchema: CompareOutputSchema.shape,
      annotations: {
        title: 'Compare Cryptocurrencies',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleCompareCrypto(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'analysis-candlestick',
    {
      title: 'Get Candlestick Data',
      description:
        'Get OHLCV candlestick data for a cryptocurrency from a specific exchange. Useful for charting and technical analysis.',
      inputSchema: GetCandlestickDataSchema.shape,
      outputSchema: CandlestickOutputSchema.shape,
      annotations: {
        title: 'Get Candlestick Data',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetCandlestickData(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'price-convert',
    {
      title: 'Get Price Conversion',
      description:
        'Convert a cryptocurrency amount to any fiat currency (e.g. USD, EUR, JPY). Uses real-time exchange rates for accurate conversions.',
      inputSchema: GetPriceConversionSchema.shape,
      outputSchema: PriceConversionOutputSchema.shape,
      annotations: {
        title: 'Get Price Conversion',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetPriceConversion(args);
      return result as unknown as CallToolResult;
    }
  );

  server.registerTool(
    'assets-info',
    {
      title: 'Get Asset Info',
      description:
        'Get detailed metadata for a cryptocurrency including ID, rank, supply, max supply, VWAP, market cap, and 24h volume.',
      inputSchema: GetAssetInfoSchema.shape,
      outputSchema: AssetInfoOutputSchema.shape,
      annotations: {
        title: 'Get Asset Info',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, _extra) => {
      const result = await handleGetAssetInfo(args);
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

  server.registerPrompt(
    'compare-cryptocurrencies',
    {
      title: 'Compare Cryptocurrencies',
      description:
        'Compare 2-5 cryptocurrencies side-by-side covering price, market cap, volume, and 24h performance',
      argsSchema: {
        symbols: z
          .string()
          .describe(
            'Comma-separated list of 2-5 cryptocurrency symbols (e.g. BTC,ETH,SOL)'
          ),
      },
    },
    ({ symbols }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please compare the following cryptocurrencies: ${symbols}. Use the available tools to:
1. Get the current price and 24h stats for each
2. Compare them side-by-side including price, market cap, volume, and rank
3. Highlight the best and worst performers over the last 24 hours

Provide a clear comparison table and identify which crypto has the strongest momentum.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'market-overview',
    {
      title: 'Market Overview',
      description:
        'Get a comprehensive overview of the cryptocurrency market including global metrics, top assets, and top exchanges',
    },
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please provide a comprehensive overview of the cryptocurrency market. Use the available tools to:
1. Get global market metrics including total market cap, volume, and BTC dominance
2. Get the top 10 assets by market cap
3. Get the top exchanges by 24h volume

Summarize the current state of the market, highlighting any notable trends.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'crypto-conversion',
    {
      title: 'Crypto Conversion',
      description:
        'Convert a cryptocurrency amount to a fiat currency with real-time rates',
      argsSchema: {
        symbol: z
          .string()
          .describe('Cryptocurrency symbol (e.g. BTC, ETH, SOL)'),
        amount: z
          .number()
          .optional()
          .describe('Amount to convert (default: 1)'),
        currency: z
          .string()
          .optional()
          .describe('Target fiat currency code (e.g. USD, EUR, JPY, GBP)'),
      },
    },
    ({ symbol, amount, currency }) => {
      const amt = amount ?? 1;
      const cur = currency ?? 'USD';
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please convert ${amt} ${symbol.toUpperCase()} to ${cur.toUpperCase()}. Use the available tools to:
1. Get the current price of ${symbol.toUpperCase()}
2. Get the USD-to-${cur.toUpperCase()} exchange rate
3. Calculate the converted amount

Show the exchange rate and final converted value clearly.`,
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'exchange-analysis',
    {
      title: 'Exchange Analysis',
      description:
        'Analyze trading activity for a cryptocurrency across exchanges, including volume distribution and top markets',
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
            text: `Please analyze the exchange landscape for ${symbol}. Use the available tools to:
1. Get market analysis showing the top exchanges trading ${symbol.toUpperCase()}
2. Get the top exchanges by overall 24h volume
3. Identify which exchanges have the best liquidity for ${symbol.toUpperCase()}

Summarize the findings including volume distribution and recommended exchanges for trading ${symbol.toUpperCase()}.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'technical-analysis',
    {
      title: 'Technical Analysis',
      description:
        'Get a full technical analysis of a cryptocurrency including indicators, candlestick patterns, and historical trends',
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
            text: `Please perform a comprehensive technical analysis of ${symbol}. Use the available tools to:
1. Get the latest technical indicators (SMA, EMA, RSI, MACD, VWAP)
2. Get candlestick data over the last 7 days with daily intervals
3. Get historical price trends over the past 14 days

Summarize the technical outlook: is ${symbol.toUpperCase()} bullish or bearish? What do the indicators suggest?`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'crypto-screener',
    {
      title: 'Crypto Screener',
      description:
        'Search for cryptocurrencies matching a query and screen the results for the best opportunities',
      argsSchema: {
        query: z
          .string()
          .describe(
            'Search query — name, symbol, or partial match (e.g. "bit", "defi", "layer")'
          ),
      },
    },
    ({ query }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please screen cryptocurrencies matching "${query}". Use the available tools to:
1. Search for assets matching "${query}"
2. Get detailed info for the top 3 results including price, market cap, rank, and supply
3. Compare them side-by-side

Identify which of the results have the strongest fundamentals and price performance.`,
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

  // Register a resource template for asset lookups by symbol
  server.registerResource(
    'asset-info',
    'asset://{symbol}',
    {
      title: 'Asset Info',
      description:
        'Cryptocurrency asset information by symbol (e.g. asset://BTC)',
      mimeType: 'application/json',
    },
    async (uri) => {
      const symbol = uri.pathname.replace(/^\//, '');
      const { searchAsset } = await import('./services/coincap.js');
      const asset = await searchAsset(symbol.toUpperCase());
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: asset
              ? JSON.stringify(asset)
              : JSON.stringify({ error: `Asset ${symbol} not found` }),
          },
        ],
      };
    }
  );

  return server.server;
}

export default createServer;

async function main() {
  if (!process.env.COINCAP_API_KEY) {
    throw new Error(
      'COINCAP_API_KEY environment variable is required. Get your free API key at https://pro.coincap.io/dashboard'
    );
  }
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
