import { z } from 'zod';
import { searchAsset, getMarkets } from '../services/coincap.js';
import { formatMarketAnalysis } from '../services/formatters.js';

export const GetMarketAnalysisSchema = z.object({
  symbol: z.string().min(1),
});

export async function handleGetMarketAnalysis(args: unknown) {
  const { symbol } = GetMarketAnalysisSchema.parse(args);
  const upperSymbol = symbol.toUpperCase();

  try {
    const asset = await searchAsset(upperSymbol);

    if (!asset) {
      return {
        content: [{ type: "text", text: `Could not find cryptocurrency with symbol ${upperSymbol}` }],
      };
    }

    const marketsData = await getMarkets(asset.id);

    if (!marketsData) {
      return {
        content: [{ type: "text", text: "Failed to retrieve market data" }],
      };
    }

    return {
      content: [{ type: "text", text: formatMarketAnalysis(asset, marketsData.data) }],
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: error instanceof Error ? error.message : `Failed to retrieve data: ${String(error)}`
      }],
    };
  }
}