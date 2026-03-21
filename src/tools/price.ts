import { z } from 'zod';
import { searchAsset } from '../services/coincap.js';
import { formatPriceInfo } from '../services/formatters.js';

export const GetPriceArgumentsSchema = z.object({
  symbol: z.string().min(1).describe("Cryptocurrency symbol or name (e.g. BTC or Bitcoin)"),
});

export async function handleGetPrice(args: unknown) {
  const { symbol } = GetPriceArgumentsSchema.parse(args);
  const upperSymbol = symbol.toUpperCase();

  try {
    const asset = await searchAsset(upperSymbol);

    if (!asset) {
      return {
        content: [{ type: "text", text: `Could not find cryptocurrency with symbol ${upperSymbol}` }],
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