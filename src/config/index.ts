import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

function readVersion(): string {
  try {
    const dir = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(resolve(dir, '../../package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

export const COINCAP_API_BASE = "https://rest.coincap.io/v3";

export const SERVER_CONFIG = {
  name: "mcp-crypto-price",
  version: readVersion(),
} as const;

export const CACHE_TTL = 60000; // 1 minute cache