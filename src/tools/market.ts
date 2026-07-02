import { z } from 'zod';
import { searchAsset, getMarkets } from '../services/coincap.js';
import { formatMarketAnalysis } from '../services/formatters.js';

export const GetMarketAnalysisSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol or name (e.g. BTC or Bitcoin)'),
});

export const MarketAnalysisOutputSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  priceUsd: z.string(),
  volumeUsd24Hr: z.string().nullable(),
  vwap24Hr: z.string().nullable(),
  topMarkets: z.array(
    z.object({
      exchangeId: z.string(),
      priceUsd: z.string(),
      volumeUsd24Hr: z.string(),
      volumePercent: z.string(),
    })
  ),
});

export async function handleGetMarketAnalysis(args: unknown) {
  const { symbol } = GetMarketAnalysisSchema.parse(args);
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

    const marketsData = await getMarkets(asset.id);

    if (!marketsData) {
      return {
        content: [{ type: 'text', text: 'Failed to retrieve market data' }],
      };
    }

    const totalVolume = marketsData.data.reduce(
      (sum, market) => sum + parseFloat(market.volumeUsd24Hr),
      0
    );
    const topMarkets = marketsData.data
      .sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr))
      .slice(0, 5)
      .map((market) => ({
        exchangeId: market.exchangeId,
        priceUsd: market.priceUsd,
        volumeUsd24Hr: market.volumeUsd24Hr,
        volumePercent: (
          (parseFloat(market.volumeUsd24Hr) / totalVolume) *
          100
        ).toFixed(2),
      }));

    return {
      content: [
        { type: 'text', text: formatMarketAnalysis(asset, marketsData.data) },
      ],
      structuredContent: {
        name: asset.name,
        symbol: asset.symbol,
        priceUsd: asset.priceUsd,
        volumeUsd24Hr: asset.volumeUsd24Hr,
        vwap24Hr: asset.vwap24Hr,
        topMarkets,
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
              : `Failed to retrieve data: ${String(error)}`,
        },
      ],
    };
  }
}
