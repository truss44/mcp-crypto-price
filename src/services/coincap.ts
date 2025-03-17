import { COINCAP_API_V2_BASE, COINCAP_API_V3_BASE, CACHE_TTL } from '../config/index.js';
import type { AssetsResponse, CacheEntry, HistoricalData, MarketsResponse } from '../types/index.js';

const cache = new Map<string, CacheEntry<any>>();

// Expose cache clear function for testing
export function clearCache(): void {
  cache.clear();
}

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
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

/**
 * Makes a request to the CoinCap API with fallback logic:
 * 1. If API key is provided, tries v3 API first
 * 2. If v3 fails or no API key is provided, falls back to v2
 * 3. If both fail, throws an error
 */
async function makeCoinCapRequest<T>(endpoint: string): Promise<T> {
  // Check cache first
  const cacheKey = endpoint;
  const cachedData = getCachedData<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const apiKey = process.env.COINCAP_API_KEY;
  let error: Error | null = null;
  
  // Try v3 API if API key is provided
  if (apiKey) {
    try {
      const v3Response = await fetch(`${COINCAP_API_V3_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (v3Response.ok) {
        const data = await v3Response.json() as T;
        setCacheData(cacheKey, data);
        return data;
      } else {
        error = new Error(`V3 API error: ${v3Response.status} - ${v3Response.statusText}`);
        console.warn("V3 API request failed, falling back to V2:", error.message);
      }
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      console.warn("V3 API request failed, falling back to V2:", error.message);
    }
  }
  
  // Fall back to v2 API
  try {
    const headers: HeadersInit = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const v2Response = await fetch(`${COINCAP_API_V2_BASE}${endpoint}`, { headers });
    
    if (v2Response.ok) {
      const data = await v2Response.json() as T;
      setCacheData(cacheKey, data);
      return data;
    } else {
      throw new Error(`V2 API error: ${v2Response.status} - ${v2Response.statusText}`);
    }
  } catch (e) {
    const v2Error = e instanceof Error ? e : new Error(String(e));
    console.error("V2 API request failed:", v2Error.message);
    
    // If we have both errors, combine them for better debugging
    if (error) {
      throw new Error(`API requests failed. V3: ${error.message}, V2: ${v2Error.message}`);
    } else {
      throw v2Error;
    }
  }
}

export async function getAssets(): Promise<AssetsResponse | null> {
  try {
    return await makeCoinCapRequest<AssetsResponse>('/assets');
  } catch (error) {
    console.error("Failed to get assets:", error);
    return null;
  }
}

export async function getMarkets(assetId: string): Promise<MarketsResponse | null> {
  try {
    return await makeCoinCapRequest<MarketsResponse>(`/assets/${assetId}/markets`);
  } catch (error) {
    console.error(`Failed to get markets for asset ${assetId}:`, error);
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
      `/assets/${assetId}/history?interval=${interval}&start=${start}&end=${end}`
    );
  } catch (error) {
    console.error(`Failed to get historical data for asset ${assetId}:`, error);
    return null;
  }
}