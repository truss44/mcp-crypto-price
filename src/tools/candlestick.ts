import { z, ZodError } from 'zod';
import { searchAsset, getCandles } from '../services/coincap.js';
import { formatCandlestickData } from '../services/formatters.js';

export const GetCandlestickDataSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol or name (e.g. BTC or Bitcoin)'),
  exchange: z
    .string()
    .default('poloniex')
    .describe('Exchange ID (e.g. "poloniex", "bittrex", "kraken", "binance")'),
  quote: z
    .string()
    .default('usd')
    .describe('Quote currency ID (e.g. "usd", "usdt", "btc")'),
  interval: z
    .enum(['m5', 'm15', 'm30', 'h1', 'h2', 'h6', 'h12', 'd1'])
    .default('h1')
    .describe(
      'Candle interval: m5=5min, m15=15min, m30=30min, h1=1hr, h2=2hr, h6=6hr, h12=12hr, d1=daily'
    ),
  days: z
    .number()
    .min(1)
    .max(30)
    .default(1)
    .describe('Number of days of candlestick data to retrieve (1-30)'),
});

export async function handleGetCandlestickData(args: unknown) {
  try {
    const { symbol, exchange, quote, interval, days } =
      GetCandlestickDataSchema.parse(args);
    const upperSymbol = symbol.toUpperCase();
    const asset = await searchAsset(upperSymbol);

    if (!asset) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not find cryptocurrency with symbol ${upperSymbol}`,
          },
        ],
      };
    }

    const now = Date.now();
    const end = now - (now % 60000);
    const start = end - days * 24 * 60 * 60 * 1000;
    const candlesData = await getCandles(
      exchange,
      asset.id,
      quote,
      interval,
      start,
      end
    );

    if (!candlesData) {
      return {
        content: [
          { type: 'text', text: 'Failed to retrieve candlestick data' },
        ],
      };
    }

    if (!candlesData.data.length) {
      return {
        content: [
          {
            type: 'text',
            text: `No candlestick data available for ${asset.name} (${asset.symbol}) on ${exchange} with quote ${quote.toUpperCase()}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: formatCandlestickData(asset, candlesData.data, exchange),
        },
      ],
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Invalid input: ${error.issues.map((e) => e.message).join(', ')}`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text:
            error instanceof Error
              ? error.message
              : `Failed to retrieve candlestick data: ${String(error)}`,
        },
      ],
    };
  }
}
