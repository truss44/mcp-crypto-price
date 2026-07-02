import { z } from 'zod';
import { searchAsset } from '../services/coincap.js';
import { formatPriceInfo } from '../services/formatters.js';

export const GetPriceArgumentsSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol or name (e.g. BTC or Bitcoin)'),
});

export const PriceOutputSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  priceUsd: z.string(),
  changePercent24Hr: z.string().nullable(),
  volumeUsd24Hr: z.string().nullable(),
  marketCapUsd: z.string().nullable(),
  rank: z.string().nullable(),
});

export async function handleGetPrice(args: unknown) {
  const { symbol } = GetPriceArgumentsSchema.parse(args);
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

    return {
      content: [{ type: 'text', text: formatPriceInfo(asset) }],
      structuredContent: {
        name: asset.name,
        symbol: asset.symbol,
        priceUsd: asset.priceUsd,
        changePercent24Hr: asset.changePercent24Hr,
        volumeUsd24Hr: asset.volumeUsd24Hr,
        marketCapUsd: asset.marketCapUsd,
        rank: asset.rank,
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
              : `Failed to retrieve cryptocurrency data: ${String(error)}`,
        },
      ],
    };
  }
}
