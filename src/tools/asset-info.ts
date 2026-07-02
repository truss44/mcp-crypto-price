import { z, ZodError } from 'zod';
import { searchAsset } from '../services/coincap.js';
import { formatAssetInfo } from '../services/formatters.js';

export const GetAssetInfoSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol or name (e.g. BTC or Bitcoin)'),
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
