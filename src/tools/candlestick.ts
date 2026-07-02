import { z, ZodError } from 'zod';
import { searchAsset, getCandles } from '../services/coincap.js';
import { formatCandlestickData } from '../services/formatters.js';

export const GetCandlestickDataSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol or name (e.g. BTC or Bitcoin)'),
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

export const CandlestickOutputSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  candles: z.array(
    z.object({
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      time: z.number(),
    })
  ),
});

export async function handleGetCandlestickData(args: unknown) {
  try {
    const { symbol, interval, days } = GetCandlestickDataSchema.parse(args);
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
        structuredContent: {
          name: '',
          symbol: upperSymbol,
          candles: [],
        },
      };
    }

    const now = Date.now();
    const end = now - (now % 60000);
    const start = end - days * 24 * 60 * 60 * 1000;
    const candlesData = await getCandles(asset.id, interval, start, end);

    if (!candlesData) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve candlestick data for ${asset.name} (${asset.symbol}).`,
          },
        ],
        structuredContent: {
          name: asset.name,
          symbol: asset.symbol,
          candles: [],
        },
      };
    }

    if (!candlesData.candles.length) {
      return {
        content: [
          {
            type: 'text',
            text: `No candlestick data available for ${asset.name} (${asset.symbol})`,
          },
        ],
        structuredContent: {
          name: asset.name,
          symbol: asset.symbol,
          candles: [],
        },
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: formatCandlestickData(asset, candlesData.candles),
        },
      ],
      structuredContent: {
        name: asset.name,
        symbol: asset.symbol,
        candles: candlesData.candles.map((c) => ({
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          time: c.time,
        })),
      },
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
        structuredContent: {
          name: '',
          symbol: '',
          candles: [],
        },
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
      structuredContent: {
        name: '',
        symbol: '',
        candles: [],
      },
    };
  }
}
