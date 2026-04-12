import { COINCAP_API_BASE, getCacheTtl } from '../config/index.js';
import type { AssetsResponse, CacheEntry, CryptoAsset, HistoricalData, MarketsResponse, Rate, RateResponse, RatesResponse } from '../types/index.js';
import { AssetsResponseSchema, HistoricalDataSchema, MarketsResponseSchema, RateResponseSchema, RatesResponseSchema } from './schemas.js';
import type { ZodType } from 'zod';

const API_KEY_ERROR_MESSAGE =
  'CoinCap API key is required. The v2 API has been sunset and all requests now use the v3 API, which requires an API key.\n\n' +
  'A free tier is available! Get your API key at: https://pro.coincap.io/dashboard\n\n' +
  'Then set the COINCAP_API_KEY environment variable in your MCP client configuration.';

export class MissingApiKeyError extends Error {
  constructor() {
    super(API_KEY_ERROR_MESSAGE);
    this.name = 'MissingApiKeyError';
  }
}

const cache = new Map<string, CacheEntry<any>>();

// Expose cache clear function for testing
export function clearCache(): void {
  cache.clear();
}

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > getCacheTtl()) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCacheData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

async function makeCoinCapRequest<T>(endpoint: string, schema?: ZodType<T>): Promise<T> {
  // Check cache first
  const cacheKey = endpoint;
  const cachedData = getCachedData<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const apiKey = process.env.COINCAP_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const response = await fetch(`${COINCAP_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`CoinCap API error: ${response.status} - ${response.statusText}`);
  }

  const raw = await response.json();
  const data = schema ? schema.parse(raw) : raw as T;
  setCacheData(cacheKey, data);
  return data;
}

export async function getAssets(): Promise<AssetsResponse | null> {
  try {
    return await makeCoinCapRequest<AssetsResponse>('/assets', AssetsResponseSchema);
  } catch (error) {
    if (error instanceof MissingApiKeyError) throw error;
    console.error("Failed to get assets:", error);
    return null;
  }
}

export async function searchAsset(symbol: string): Promise<CryptoAsset | null> {
  try {
    const upperSymbol = symbol.toUpperCase();
    const data = await makeCoinCapRequest<AssetsResponse>(`/assets?search=${encodeURIComponent(symbol)}`, AssetsResponseSchema);
    const asset =
      data.data.find((a) => a.symbol.toUpperCase() === upperSymbol) ??
      data.data.find((a) => a.name.toUpperCase() === upperSymbol);
    return asset ?? null;
  } catch (error) {
    if (error instanceof MissingApiKeyError) throw error;
    console.error(`Failed to search for asset ${symbol}:`, error);
    return null;
  }
}

export async function getMarkets(assetId: string): Promise<MarketsResponse | null> {
  try {
    return await makeCoinCapRequest<MarketsResponse>(`/assets/${assetId}/markets`, MarketsResponseSchema);
  } catch (error) {
    if (error instanceof MissingApiKeyError) throw error;
    console.error(`Failed to get markets for asset ${assetId}:`, error);
    return null;
  }
}

export async function getRates(): Promise<Rate[] | null> {
  try {
    const response = await makeCoinCapRequest<RatesResponse>('/rates', RatesResponseSchema);
    return response.data;
  } catch (error) {
    if (error instanceof MissingApiKeyError) throw error;
    console.error('Failed to get rates:', error);
    return null;
  }
}

export async function getRate(slug: string): Promise<Rate | null> {
  try {
    const response = await makeCoinCapRequest<RateResponse>(
      `/rates/${encodeURIComponent(slug)}`,
      RateResponseSchema
    );
    return response.data;
  } catch (error) {
    if (error instanceof MissingApiKeyError) throw error;
    console.error(`Failed to get rate for ${slug}:`, error);
    return null;
  }
}

export async function getHistoricalData(
  assetId: string,
  interval: string,
  start: number,
  end: number
): Promise<HistoricalData | null> {
  try {
    return await makeCoinCapRequest<HistoricalData>(
      `/assets/${assetId}/history?interval=${interval}&start=${start}&end=${end}`,
      HistoricalDataSchema
    );
  } catch (error) {
    if (error instanceof MissingApiKeyError) throw error;
    console.error(`Failed to get historical data for asset ${assetId}:`, error);
    return null;
  }
}
