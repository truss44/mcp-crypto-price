import { z } from 'zod';
import { getAssets, getMarkets } from '../services/coincap.js';
import { formatMarketAnalysis } from '../services/formatters.js';

export const GetMarketAnalysisSchema = z.object({
  symbol: z.string().min(1),
});

export async function handleGetMarketAnalysis(args: unknown) {
  const { symbol } = GetMarketAnalysisSchema.parse(args);
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