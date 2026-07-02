#!/usr/bin/env node

import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './index.js';
import { SERVER_CONFIG } from './config/index.js';
import { renderHomepage } from './homepage.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

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

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = createServer({ config: { COINCAP_API_KEY: coincapApiKey } });
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
    description:
      'A Model Context Protocol server providing cryptocurrency price, market, and on-chain data from CoinCap.',
  },
  tools: [
    {
      name: 'price-get',
      description: 'Get current price and 24h stats for a cryptocurrency',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)',
          },
        },
        required: ['symbol'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          symbol: { type: 'string' },
          priceUsd: { type: 'string' },
          changePercent24Hr: { type: ['string', 'null'] },
          volumeUsd24Hr: { type: ['string', 'null'] },
          marketCapUsd: { type: ['string', 'null'] },
          rank: { type: ['string', 'null'] },
        },
        required: [
          'name',
          'symbol',
          'priceUsd',
          'changePercent24Hr',
          'volumeUsd24Hr',
          'marketCapUsd',
          'rank',
        ],
      },
      annotations: {
        title: 'Get Crypto Price',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'market-analysis',
      description:
        'Get detailed market analysis including top exchanges and volume distribution',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)',
          },
        },
        required: ['symbol'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          symbol: { type: 'string' },
          priceUsd: { type: 'string' },
          volumeUsd24Hr: { type: ['string', 'null'] },
          vwap24Hr: { type: ['string', 'null'] },
          topMarkets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exchangeId: { type: 'string' },
                priceUsd: { type: 'string' },
                volumeUsd24Hr: { type: 'string' },
                volumePercent: { type: 'string' },
              },
              required: [
                'exchangeId',
                'priceUsd',
                'volumeUsd24Hr',
                'volumePercent',
              ],
            },
          },
        },
        required: [
          'name',
          'symbol',
          'priceUsd',
          'volumeUsd24Hr',
          'vwap24Hr',
          'topMarkets',
        ],
      },
      annotations: {
        title: 'Get Market Analysis',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'analysis-historical',
      description: 'Get historical price analysis with customizable timeframe',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)',
          },
          interval: {
            type: 'string',
            enum: ['m5', 'm15', 'm30', 'h1', 'h2', 'h6', 'h12', 'd1'],
            default: 'h1',
            description:
              'Data interval: m1=1min, m5=5min, m15=15min, m30=30min, h1=1hr, h2=2hr, h6=6hr, h12=12hr, d1=daily',
          },
          days: {
            type: 'number',
            minimum: 1,
            maximum: 30,
            default: 7,
            description: 'Number of days of historical data to retrieve (1-30)',
          },
        },
        required: ['symbol'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          symbol: { type: 'string' },
          periodHigh: { type: 'number' },
          periodLow: { type: 'number' },
          priceChangePercent: { type: 'string' },
          currentPrice: { type: 'number' },
          startingPrice: { type: 'number' },
          priceRange: { type: 'number' },
          rangePercentage: { type: 'string' },
        },
        required: [
          'name',
          'symbol',
          'periodHigh',
          'periodLow',
          'priceChangePercent',
          'currentPrice',
          'startingPrice',
          'priceRange',
          'rangePercentage',
        ],
      },
      annotations: {
        title: 'Get Historical Analysis',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'assets-top',
      description: 'Get top cryptocurrencies ranked by market cap',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            default: 10,
            description:
              'Number of top assets to return, ranked by market cap (1-50)',
          },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          assets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                rank: { type: ['string', 'null'] },
                symbol: { type: 'string' },
                name: { type: 'string' },
                priceUsd: { type: 'string' },
                changePercent24Hr: { type: ['string', 'null'] },
                marketCapUsd: { type: ['string', 'null'] },
              },
              required: [
                'id',
                'rank',
                'symbol',
                'name',
                'priceUsd',
                'changePercent24Hr',
                'marketCapUsd',
              ],
            },
          },
        },
        required: ['assets'],
      },
      annotations: {
        title: 'Get Top Assets',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'analysis-technical',
      description:
        'Get the latest technical indicators for a cryptocurrency including SMA, EMA, RSI, MACD, and VWAP',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)',
          },
        },
        required: ['symbol'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          symbol: { type: 'string' },
          currentPrice: { type: 'string' },
          sma: {
            type: ['object', 'null'],
            properties: {
              period: { type: 'number' },
              value: { type: 'string' },
            },
          },
          ema: {
            type: ['object', 'null'],
            properties: {
              period: { type: 'number' },
              value: { type: 'string' },
            },
          },
          rsi: {
            type: ['object', 'null'],
            properties: {
              period: { type: 'number' },
              value: { type: 'string' },
              signal: { type: 'string' },
            },
          },
          macd: {
            type: ['object', 'null'],
            properties: {
              value: { type: 'string' },
              signal: { type: 'string' },
              histogram: { type: 'string' },
              signalLabel: { type: 'string' },
            },
          },
          vwap: {
            type: ['object', 'null'],
            properties: {
              value: { type: 'string' },
            },
          },
        },
        required: [
          'name',
          'symbol',
          'currentPrice',
          'sma',
          'ema',
          'rsi',
          'macd',
          'vwap',
        ],
      },
      annotations: {
        title: 'Get Technical Analysis',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'market-rates',
      description:
        "Get USD-based conversion rates for fiat currencies and cryptocurrencies. Optionally pass a slug (e.g. 'euro', 'us-dollar', 'bitcoin') to look up a single rate.",
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description:
              "Optional: rate slug to fetch a single rate (e.g. 'us-dollar', 'euro', 'bitcoin')",
          },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          rates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                symbol: { type: 'string' },
                currencySymbol: { type: ['string', 'null'] },
                type: { type: 'string' },
                rateUsd: { type: 'string' },
              },
              required: ['id', 'symbol', 'currencySymbol', 'type', 'rateUsd'],
            },
          },
        },
        required: ['rates'],
      },
      annotations: {
        title: 'Get Currency Rates',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'market-exchanges',
      description:
        "Get top cryptocurrency exchanges ranked by 24h volume. Optionally pass an exchangeId (e.g. 'binance', 'coinbase') to get details for a specific exchange.",
      inputSchema: {
        type: 'object',
        properties: {
          exchangeId: {
            type: 'string',
            description:
              "Optional: specific exchange ID to look up (e.g. 'binance', 'coinbase', 'kraken')",
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            default: 10,
            description:
              'Number of top exchanges to return when listing (1-50, default 10)',
          },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          exchanges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exchangeId: { type: 'string' },
                name: { type: 'string' },
                rank: { type: 'string' },
                percentTotalVolume: { type: ['string', 'null'] },
                volumeUsd: { type: ['string', 'null'] },
                tradingPairs: { type: ['string', 'null'] },
                socket: { type: ['boolean', 'null'] },
              },
              required: [
                'exchangeId',
                'name',
                'rank',
                'percentTotalVolume',
                'volumeUsd',
                'tradingPairs',
                'socket',
              ],
            },
          },
        },
        required: ['exchanges'],
      },
      annotations: {
        title: 'Get Exchanges',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'assets-search',
      description:
        'Search for cryptocurrencies by name, symbol, or partial match. Returns multiple matching assets with their ID, name, symbol, rank, and current price.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Search query — cryptocurrency name, symbol, or partial match (e.g. "bit", "eth", "doge")',
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            default: 10,
            description:
              'Maximum number of results to return (1-50, default 10)',
          },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                rank: { type: ['string', 'null'] },
                symbol: { type: 'string' },
                name: { type: 'string' },
                priceUsd: { type: 'string' },
              },
              required: ['id', 'rank', 'symbol', 'name', 'priceUsd'],
            },
          },
        },
        required: ['results'],
      },
      annotations: {
        title: 'Search Crypto Assets',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'market-global',
      description:
        'Get a global overview of the cryptocurrency market including total market capitalization, 24-hour trading volume, Bitcoin dominance percentage, and the number of active cryptocurrencies.',
      inputSchema: {
        type: 'object',
      },
      outputSchema: {
        type: 'object',
        properties: {
          totalMarketCap: { type: 'number' },
          totalVolume: { type: 'number' },
          btcDominance: { type: 'string' },
          activeCryptocurrencies: { type: 'number' },
        },
        required: [
          'totalMarketCap',
          'totalVolume',
          'btcDominance',
          'activeCryptocurrencies',
        ],
      },
      annotations: {
        title: 'Get Global Metrics',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'assets-compare',
      description:
        'Compare 2-5 cryptocurrencies side-by-side including price, 24h change, volume, market cap, and rank. Pass symbols as a comma-separated list (e.g. "BTC,ETH,SOL").',
      inputSchema: {
        type: 'object',
        properties: {
          symbols: {
            type: 'string',
            description:
              'Comma-separated list of 2-5 cryptocurrency symbols or names to compare (e.g. "BTC,ETH,SOL")',
          },
        },
        required: ['symbols'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          assets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                symbol: { type: 'string' },
                priceUsd: { type: 'string' },
                changePercent24Hr: { type: ['string', 'null'] },
                volumeUsd24Hr: { type: ['string', 'null'] },
                marketCapUsd: { type: ['string', 'null'] },
                rank: { type: ['string', 'null'] },
              },
              required: [
                'name',
                'symbol',
                'priceUsd',
                'changePercent24Hr',
                'volumeUsd24Hr',
                'marketCapUsd',
                'rank',
              ],
            },
          },
          notFound: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['assets', 'notFound'],
      },
      annotations: {
        title: 'Compare Cryptocurrencies',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'analysis-candlestick',
      description:
        'Get OHLCV candlestick data for a cryptocurrency from a specific exchange. Useful for charting and technical analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)',
          },
          exchange: {
            type: 'string',
            default: 'poloniex',
            description:
              'Exchange ID (e.g. "poloniex", "bittrex", "kraken", "binance")',
          },
          quote: {
            type: 'string',
            default: 'usd',
            description: 'Quote currency ID (e.g. "usd", "usdt", "btc")',
          },
          interval: {
            type: 'string',
            enum: ['m5', 'm15', 'm30', 'h1', 'h2', 'h6', 'h12', 'd1'],
            default: 'h1',
            description:
              'Candle interval: m5=5min, m15=15min, m30=30min, h1=1hr, h2=2hr, h6=6hr, h12=12hr, d1=daily',
          },
          days: {
            type: 'number',
            minimum: 1,
            maximum: 30,
            default: 1,
            description:
              'Number of days of candlestick data to retrieve (1-30)',
          },
        },
        required: ['symbol'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          symbol: { type: 'string' },
          exchange: { type: 'string' },
          candles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                open: { type: 'string' },
                high: { type: 'string' },
                low: { type: 'string' },
                close: { type: 'string' },
                volume: { type: 'string' },
                period: { type: 'number' },
              },
              required: ['open', 'high', 'low', 'close', 'volume', 'period'],
            },
          },
        },
        required: ['name', 'symbol', 'exchange', 'candles'],
      },
      annotations: {
        title: 'Get Candlestick Data',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'price-convert',
      description:
        'Convert a cryptocurrency amount to any fiat currency (e.g. USD, EUR, JPY). Uses real-time exchange rates for accurate conversions.',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description:
              'Cryptocurrency symbol to convert from (e.g. BTC, ETH)',
          },
          amount: {
            type: 'number',
            minimum: 0,
            exclusiveMinimum: 0,
            default: 1,
            description: 'Amount of the cryptocurrency to convert (default 1)',
          },
          currency: {
            type: 'string',
            default: 'usd',
            description:
              'Target currency code (e.g. "usd", "eur", "gbp", "jpy")',
          },
        },
        required: ['symbol'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          fromSymbol: { type: 'string' },
          amount: { type: 'number' },
          toCurrency: { type: 'string' },
          conversionRate: { type: 'number' },
          convertedAmount: { type: 'number' },
        },
        required: [
          'fromSymbol',
          'amount',
          'toCurrency',
          'conversionRate',
          'convertedAmount',
        ],
      },
      annotations: {
        title: 'Get Price Conversion',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    {
      name: 'assets-info',
      description:
        'Get detailed metadata for a cryptocurrency including ID, rank, supply, max supply, VWAP, market cap, and 24h volume.',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Cryptocurrency symbol or name (e.g. BTC or Bitcoin)',
          },
        },
        required: ['symbol'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          rank: { type: ['string', 'null'] },
          symbol: { type: 'string' },
          name: { type: 'string' },
          priceUsd: { type: 'string' },
          changePercent24Hr: { type: ['string', 'null'] },
          marketCapUsd: { type: ['string', 'null'] },
          volumeUsd24Hr: { type: ['string', 'null'] },
          supply: { type: ['string', 'null'] },
          maxSupply: { type: ['string', 'null'] },
          vwap24Hr: { type: ['string', 'null'] },
        },
        required: [
          'id',
          'rank',
          'symbol',
          'name',
          'priceUsd',
          'changePercent24Hr',
          'marketCapUsd',
          'volumeUsd24Hr',
          'supply',
          'maxSupply',
          'vwap24Hr',
        ],
      },
      annotations: {
        title: 'Get Asset Info',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
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
    {
      name: 'asset-info',
      uri: 'asset://{symbol}',
      description:
        'Cryptocurrency asset information by symbol (e.g. asset://BTC)',
      mimeType: 'application/json',
    },
  ],
  prompts: [
    {
      name: 'analyze-crypto',
      description:
        'Generate a comprehensive analysis of a cryptocurrency covering price, market, and historical trends',
    },
    {
      name: 'compare-cryptocurrencies',
      description:
        'Compare 2-5 cryptocurrencies side-by-side covering price, market cap, volume, and 24h performance',
    },
    {
      name: 'market-overview',
      description:
        'Get a comprehensive overview of the cryptocurrency market including global metrics, top assets, and top exchanges',
    },
    {
      name: 'crypto-conversion',
      description:
        'Convert a cryptocurrency amount to a fiat currency with real-time rates',
    },
    {
      name: 'exchange-analysis',
      description:
        'Analyze trading activity for a cryptocurrency across exchanges, including volume distribution and top markets',
    },
    {
      name: 'technical-analysis',
      description:
        'Get a full technical analysis of a cryptocurrency including indicators, candlestick patterns, and historical trends',
    },
    {
      name: 'crypto-screener',
      description:
        'Search for cryptocurrencies matching a query and screen the results for the best opportunities',
    },
  ],
};

const httpServer = http.createServer(async (req, res) => {
  const parsed = new URL(req.url ?? '/', `http://localhost`);
  const pathname = parsed.pathname;

  // MCP server card for discovery (required by Smithery)
  if (
    pathname === '/.well-known/mcp/server-card.json' &&
    req.method === 'GET'
  ) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(serverCard));
    return;
  }

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
