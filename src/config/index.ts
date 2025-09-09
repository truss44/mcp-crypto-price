export const COINCAP_API_V2_BASE = "https://api.coincap.io/v2";
export const COINCAP_API_V3_BASE = "https://rest.coincap.io/v3";

export const SERVER_CONFIG = {
  name: "mcp-crypto-price",
  version: "2.1.0",
} as const;

export const CACHE_TTL = 60000; // 1 minute cache