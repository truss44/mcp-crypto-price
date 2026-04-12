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

export interface Rate {
  id: string;
  symbol: string;
  currencySymbol: string | null;
  type: string;
  rateUsd: string;
}

export interface RatesResponse {
  data: Rate[];
}

export interface RateResponse {
  data: Rate;
}

export interface Exchange {
  exchangeId: string;
  name: string;
  rank: string;
  percentTotalVolume: string | null;
  volumeUsd: string | null;
  tradingPairs: string | null;
  socket: boolean | null;
  updated: number;
}

export interface ExchangesResponse {
  data: Exchange[];
}

export interface ExchangeResponse {
  data: Exchange;
}
