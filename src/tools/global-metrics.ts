import { z, ZodError } from 'zod';
import { getAssets } from '../services/coincap.js';
import { formatGlobalMetrics } from '../services/formatters.js';

export const GetGlobalMetricsSchema = z.object({});

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

    return {
      content: [{ type: 'text', text: formatGlobalMetrics(assetsData.data) }],
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
