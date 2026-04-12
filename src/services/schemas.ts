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

export const RateSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  currencySymbol: z.string().nullable(),
  type: z.string(),
  rateUsd: z.string(),
});

export const RatesResponseSchema = z.object({
  data: z.array(RateSchema),
});

export const RateResponseSchema = z.object({
  data: RateSchema,
});
