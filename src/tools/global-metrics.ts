import { z, ZodError } from 'zod';
import { getAssets } from '../services/coincap.js';
import { formatGlobalMetrics } from '../services/formatters.js';

export const GetGlobalMetricsSchema = z.object({});

export const GlobalMetricsOutputSchema = z.object({
  totalMarketCap: z.number(),
  totalVolume: z.number(),
  btcDominance: z.string(),
  activeCryptocurrencies: z.number(),
});

export async function handleGetGlobalMetrics(args: unknown) {
  try {
    GetGlobalMetricsSchema.parse(args);

    const assetsData = await getAssets();

    if (!assetsData) {
      return {
        content: [
          { type: 'text', text: 'Failed to retrieve global market data' },
        ],
      };
    }

    if (!assetsData.data.length) {
      return {
        content: [{ type: 'text', text: 'No market data available' }],
      };
    }

    const totalMarketCap = assetsData.data.reduce(
      (sum, a) => sum + parseFloat(a.marketCapUsd || '0'),
      0
    );
    const totalVolume = assetsData.data.reduce(
      (sum, a) => sum + parseFloat(a.volumeUsd24Hr || '0'),
      0
    );
    const btc = assetsData.data.find((a) => a.symbol.toUpperCase() === 'BTC');
    const btcDominance =
      btc && totalMarketCap > 0
        ? (
            (parseFloat(btc.marketCapUsd || '0') / totalMarketCap) *
            100
          ).toFixed(2)
        : 'N/A';

    return {
      content: [{ type: 'text', text: formatGlobalMetrics(assetsData.data) }],
      structuredContent: {
        totalMarketCap,
        totalVolume,
        btcDominance,
        activeCryptocurrencies: assetsData.data.length,
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
              : `Failed to retrieve global market data: ${String(error)}`,
        },
      ],
    };
  }
}
