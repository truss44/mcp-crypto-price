import { z, ZodError } from 'zod';
import { searchAsset } from '../services/coincap.js';
import { formatComparison } from '../services/formatters.js';
import type { CryptoAsset } from '../types/index.js';

export const CompareCryptoSchema = z.object({
  symbols: z
    .string()
    .min(1)
    .describe(
      'Comma-separated list of 2-5 cryptocurrency symbols or names to compare (e.g. "BTC,ETH,SOL")'
    ),
});

export async function handleCompareCrypto(args: unknown) {
  try {
    const { symbols } = CompareCryptoSchema.parse(args);
    const symbolList = symbols
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (symbolList.length < 2 || symbolList.length > 5) {
      return {
        content: [
          {
            type: 'text',
            text: 'Please provide 2-5 cryptocurrency symbols to compare (e.g. "BTC,ETH,SOL")',
          },
        ],
      };
    }

    const results: CryptoAsset[] = [];
    const notFound: string[] = [];

    for (const sym of symbolList) {
      const asset = await searchAsset(sym);
      if (asset) {
        results.push(asset);
      } else {
        notFound.push(sym);
      }
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not find any of the specified cryptocurrencies: ${symbolList.join(', ')}`,
          },
        ],
      };
    }

    let output = formatComparison(results);
    if (notFound.length > 0) {
      output += `\n\nNot found: ${notFound.join(', ')}`;
    }

    return {
      content: [{ type: 'text', text: output }],
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
              : `Failed to compare cryptocurrencies: ${String(error)}`,
        },
      ],
    };
  }
}
