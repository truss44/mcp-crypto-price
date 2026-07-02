import { z, ZodError } from 'zod';
import { searchAsset } from '../services/coincap.js';
import { formatAssetInfo } from '../services/formatters.js';

export const GetAssetInfoSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol or name (e.g. BTC or Bitcoin)'),
});

export const AssetInfoOutputSchema = z.object({
  id: z.string(),
  rank: z.string().nullable(),
  symbol: z.string(),
  name: z.string(),
  priceUsd: z.string(),
  changePercent24Hr: z.string().nullable(),
  marketCapUsd: z.string().nullable(),
  volumeUsd24Hr: z.string().nullable(),
  supply: z.string().nullable(),
  maxSupply: z.string().nullable(),
  vwap24Hr: z.string().nullable(),
});

export async function handleGetAssetInfo(args: unknown) {
  try {
    const { symbol } = GetAssetInfoSchema.parse(args);
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

    return {
      content: [{ type: 'text', text: formatAssetInfo(asset) }],
      structuredContent: {
        id: asset.id,
        rank: asset.rank,
        symbol: asset.symbol,
        name: asset.name,
        priceUsd: asset.priceUsd,
        changePercent24Hr: asset.changePercent24Hr,
        marketCapUsd: asset.marketCapUsd,
        volumeUsd24Hr: asset.volumeUsd24Hr,
        supply: asset.supply,
        maxSupply: asset.maxSupply,
        vwap24Hr: asset.vwap24Hr,
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
      };
    }
    return {
      content: [
        {
          type: 'text',
          text:
            error instanceof Error
              ? error.message
              : `Failed to retrieve asset info: ${String(error)}`,
        },
      ],
    };
  }
}
