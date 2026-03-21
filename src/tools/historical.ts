import { z } from 'zod';
import { searchAsset, getHistoricalData } from '../services/coincap.js';
import { formatHistoricalAnalysis } from '../services/formatters.js';

export const GetHistoricalAnalysisSchema = z.object({
  symbol: z.string().min(1).describe("Cryptocurrency symbol or name (e.g. BTC or Bitcoin)"),
  interval: z.enum(['m5', 'm15', 'm30', 'h1', 'h2', 'h6', 'h12', 'd1']).default('h1').describe("Data interval: m5=5min, m15=15min, m30=30min, h1=1hr, h2=2hr, h6=6hr, h12=12hr, d1=daily"),
  days: z.number().min(1).max(30).default(7).describe("Number of days of historical data to retrieve (1-30)"),
});

export async function handleGetHistoricalAnalysis(args: unknown) {
  const { symbol, interval, days } = GetHistoricalAnalysisSchema.parse(args);
  const upperSymbol = symbol.toUpperCase();

  try {
    const asset = await searchAsset(upperSymbol);

    if (!asset) {
      return {
        content: [{ type: "text", text: `Could not find cryptocurrency with symbol ${upperSymbol}` }],
      };
    }

    // Round timestamps to the nearest minute so the cache key stays stable
    // across calls made within the same 60-second TTL window
    const now = Date.now();
    const end = now - (now % 60000);
    const start = end - (days * 24 * 60 * 60 * 1000);
    const historyData = await getHistoricalData(asset.id, interval, start, end);

    if (!historyData) {
      return {
        content: [{ type: "text", text: "Failed to retrieve historical data" }],
      };
    }

    if (!historyData.data.length) {
      return {
        content: [{ type: "text", text: "No historical data available for the selected time period" }],
      };
    }

    return {
      content: [{ type: "text", text: formatHistoricalAnalysis(asset, historyData.data) }],
    };
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: error instanceof Error ? error.message : `Failed to retrieve historical data: ${String(error)}` 
      }],
    };
  }
}