import { z } from 'zod';

export const CryptoAssetSchema = z.object({
  id: z.string(),
  rank: z.string().nullable(),
  symbol: z.string(),
  name: z.string(),
  priceUsd: z.string(),
  changePercent24Hr: z.string().nullable(),
  volumeUsd24Hr: z.string().nullable(),
  marketCapUsd: z.string().nullable(),
  supply: z.string().nullable(),
  maxSupply: z.string().nullable(),
  vwap24Hr: z.string().nullable(),
});

export const AssetsResponseSchema = z.object({
  data: z.array(CryptoAssetSchema),
});

export const HistoryPointSchema = z.object({
  time: z.number(),
  priceUsd: z.string(),
  date: z.string(),
});

export const HistoricalDataSchema = z.object({
  data: z.array(HistoryPointSchema),
});

export const MarketSchema = z.object({
  exchangeId: z.string(),
  baseSymbol: z.string(),
  quoteSymbol: z.string(),
  priceUsd: z.string(),
  volumeUsd24Hr: z.string(),
  volumePercent: z.string().optional(),
});

export const MarketsResponseSchema = z.object({
  data: z.array(MarketSchema),
});

export const ExchangeSchema = z.object({
  exchangeId: z.string(),
  name: z.string(),
  rank: z.string(),
  percentTotalVolume: z.string().nullable(),
  volumeUsd: z.string().nullable(),
  tradingPairs: z.string().nullable(),
  socket: z.boolean().nullable(),
  updated: z.number(),
});

export const ExchangesResponseSchema = z.object({
  data: z.array(ExchangeSchema),
});

export const ExchangeResponseSchema = z.object({
  data: ExchangeSchema,
});
