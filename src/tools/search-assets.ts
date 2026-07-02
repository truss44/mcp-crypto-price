import { z, ZodError } from 'zod';
import { searchAssets } from '../services/coincap.js';
import { formatSearchResults } from '../services/formatters.js';

export const SearchAssetsSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      'Search query — cryptocurrency name, symbol, or partial match (e.g. "bit", "eth", "doge")'
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe('Maximum number of results to return (1-50, default 10)'),
});

export const SearchAssetsOutputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      rank: z.string().nullable(),
      symbol: z.string(),
      name: z.string(),
      priceUsd: z.string(),
    })
  ),
});

export async function handleSearchAssets(args: unknown) {
  try {
    const { query, limit } = SearchAssetsSchema.parse(args);

    const results = await searchAssets(query, limit);

    if (!results) {
      return {
        content: [{ type: 'text', text: 'Failed to search for assets' }],
      };
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No cryptocurrencies found matching "${query}"`,
          },
        ],
      };
    }

    return {
      content: [{ type: 'text', text: formatSearchResults(results) }],
      structuredContent: {
        results: results.map((a) => ({
          id: a.id,
          rank: a.rank,
          symbol: a.symbol,
          name: a.name,
          priceUsd: a.priceUsd,
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
      };
    }
    return {
      content: [
        {
          type: 'text',
          text:
            error instanceof Error
              ? error.message
              : `Failed to search for assets: ${String(error)}`,
        },
      ],
    };
  }
}
