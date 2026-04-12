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

export interface TechnicalAnalysisIndicatorSMA {
  period: number;
  value: string;
}

export interface TechnicalAnalysisIndicatorEMA {
  period: number;
  value: string;
}

export interface TechnicalAnalysisIndicatorRSI {
  period: number;
  value: string;
}

export interface TechnicalAnalysisIndicatorMACD {
  value: string;
  signal: string;
  histogram: string;
}

export interface TechnicalAnalysisIndicatorVWAP {
  value: string;
}

export interface TechnicalAnalysis {
  sma: TechnicalAnalysisIndicatorSMA | null;
  ema: TechnicalAnalysisIndicatorEMA | null;
  rsi: TechnicalAnalysisIndicatorRSI | null;
  macd: TechnicalAnalysisIndicatorMACD | null;
  vwap: TechnicalAnalysisIndicatorVWAP | null;
}