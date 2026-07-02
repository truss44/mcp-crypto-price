import { z } from 'zod';
import { searchAsset, getTechnicalAnalysis } from '../services/coincap.js';
import { formatTechnicalAnalysis } from '../services/formatters.js';

export const GetTechnicalAnalysisSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol or name (e.g. BTC or Bitcoin)'),
});

export const TechnicalAnalysisOutputSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  currentPrice: z.string(),
  sma: z.object({ period: z.number(), value: z.string() }).nullable(),
  ema: z.object({ period: z.number(), value: z.string() }).nullable(),
  rsi: z
    .object({ period: z.number(), value: z.string(), signal: z.string() })
    .nullable(),
  macd: z
    .object({
      value: z.string(),
      signal: z.string(),
      histogram: z.string(),
      signalLabel: z.string(),
    })
    .nullable(),
  vwap: z.object({ value: z.string() }).nullable(),
});

export async function handleGetTechnicalAnalysis(args: unknown) {
  const { symbol } = GetTechnicalAnalysisSchema.parse(args);
  const upperSymbol = symbol.toUpperCase();

  try {
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

    const ta = await getTechnicalAnalysis(asset.id);

    if (!ta) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve technical analysis for ${asset.name} (${asset.symbol})`,
          },
        ],
      };
    }

    const rsiValue = ta.rsi ? parseFloat(ta.rsi.value) : null;
    const rsiSignal =
      rsiValue === null
        ? 'N/A'
        : rsiValue > 70
          ? 'Overbought'
          : rsiValue < 30
            ? 'Oversold'
            : 'Neutral';

    const macdHistogram = ta.macd ? parseFloat(ta.macd.histogram) : null;
    const macdSignalLabel =
      macdHistogram === null
        ? 'N/A'
        : macdHistogram > 0
          ? 'Bullish'
          : 'Bearish';

    return {
      content: [{ type: 'text', text: formatTechnicalAnalysis(asset, ta) }],
      structuredContent: {
        name: asset.name,
        symbol: asset.symbol,
        currentPrice: asset.priceUsd,
        sma: ta.sma ? { period: ta.sma.period, value: ta.sma.value } : null,
        ema: ta.ema ? { period: ta.ema.period, value: ta.ema.value } : null,
        rsi: ta.rsi
          ? {
              period: ta.rsi.period,
              value: ta.rsi.value,
              signal: rsiSignal,
            }
          : null,
        macd: ta.macd
          ? {
              value: ta.macd.value,
              signal: ta.macd.signal,
              histogram: ta.macd.histogram,
              signalLabel: macdSignalLabel,
            }
          : null,
        vwap: ta.vwap ? { value: ta.vwap.value } : null,
      },
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text:
            error instanceof Error
              ? error.message
              : `Failed to retrieve technical analysis: ${String(error)}`,
        },
      ],
    };
  }
}
