import { z } from 'zod';
import { getAssets } from '../services/coincap.js';
import { formatPriceInfo } from '../services/formatters.js';

export const GetPriceArgumentsSchema = z.object({
  symbol: z.string().min(1),
});

export async function handleGetPrice(args: unknown) {
  const { symbol } = GetPriceArgumentsSchema.parse(args);
  const upperSymbol = symbol.toUpperCase();

  try {
    const assetsData = await getAssets();
    
    if (!assetsData) {
      return {
        content: [{ type: "text", text: "Failed to retrieve cryptocurrency data" }],
      };
    }
    
    const asset = assetsData.data.find(
      (a: { symbol: string; }) => a.symbol.toUpperCase() === upperSymbol
    );

    if (!asset) {
      return {
        content: [
          {
            type: "text",
            text: `Could not find cryptocurrency with symbol ${upperSymbol}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: formatPriceInfo(asset) }],
    };
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: error instanceof Error ? error.message : `Failed to retrieve cryptocurrency data: ${String(error)}` 
      }],
    };
  }
}