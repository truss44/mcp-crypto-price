import { z } from 'zod';
import { getAssets } from '../services/coincap.js';
import { formatTopAssets } from '../services/formatters.js';

export const GetTopAssetsSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of top assets to return, ranked by market cap (1-50)"),
});

export async function handleGetTopAssets(args: unknown) {
  const { limit } = GetTopAssetsSchema.parse(args);

  try {
    const assetsData = await getAssets();

    if (!assetsData) {
      return {
        content: [{ type: "text", text: "Failed to retrieve assets data" }],
      };
    }

    const topAssets = assetsData.data.slice(0, limit);

    if (!topAssets.length) {
      return {
        content: [{ type: "text", text: "No assets data available" }],
      };
    }

    return {
      content: [{ type: "text", text: formatTopAssets(topAssets) }],
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: error instanceof Error ? error.message : `Failed to retrieve assets data: ${String(error)}`
      }],
    };
  }
}
