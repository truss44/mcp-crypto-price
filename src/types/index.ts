export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
export interface CryptoAsset {
  id: string;
  rank: string | null;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string | null;
  volumeUsd24Hr: string | null;
  marketCapUsd: string | null;
  supply: string | null;
  maxSupply: string | null;
  vwap24Hr: string | null;
}

export interface AssetsResponse {
  data: CryptoAsset[];
}

export interface HistoricalData {
  data: Array<{
    time: number;
    priceUsd: string;
    date: string;
  }>;
}

export interface Market {
  exchangeId: string;
  baseSymbol: string;
  quoteSymbol: string;
  priceUsd: string;
  volumeUsd24Hr: string;
  volumePercent?: string;
}

export interface MarketsResponse {
  data: Market[];
}