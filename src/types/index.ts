export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
export interface CryptoAsset {
  id: string;
  rank: string;
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
    circulatingSupply?: string;
    date: string;
  }>;
}

export interface Market {
  exchangeId: string;
  baseSymbol: string;
  quoteSymbol: string;
  priceUsd: string;
  volumeUsd24Hr: string;
  percentExchangeVolume?: string | null;
}

export interface MarketsResponse {
  data: Market[];
}