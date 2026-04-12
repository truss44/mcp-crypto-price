import { z } from 'zod';
import { searchAsset, getTechnicalAnalysis } from '../services/coincap.js';
import { formatTechnicalAnalysis } from '../services/formatters.js';

export const GetTechnicalAnalysisSchema = z.object({
  symbol: z.string().min(1).describe("Cryptocurrency symbol or name (e.g. BTC or Bitcoin)"),
});

export async function handleGetTechnicalAnalysis(args: unknown) {
  const { symbol } = GetTechnicalAnalysisSchema.parse(args);
  const upperSymbol = symbol.toUpperCase();

  try {
    const asset = await searchAsset(upperSymbol);

    if (!asset) {
      return {
        content: [{ type: "text", text: `Could not find cryptocurrency with symbol ${upperSymbol}` }],
      };
    }

    const ta = await getTechnicalAnalysis(asset.id);

    if (!ta) {
      return {
        content: [{ type: "text", text: `Failed to retrieve technical analysis for ${asset.name} (${asset.symbol})` }],
      };
    }

    return {
      content: [{ type: "text", text: formatTechnicalAnalysis(asset, ta) }],
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: error instanceof Error ? error.message : `Failed to retrieve technical analysis: ${String(error)}`
      }],
    };
  }
}
