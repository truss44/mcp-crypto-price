# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (HTTP server with hot reload via Smithery CLI)
pnpm dev

# Build
pnpm build          # Compile TypeScript → dist/

# Run
pnpm start:http     # Start HTTP server (dist/http.js)
pnpm start:stdio    # Start STDIO server (dist/index.js)

# Test
pnpm test               # Run all tests with Vitest
pnpm test:coverage      # Run tests with coverage

# Lint & Format
pnpm lint           # Check for lint errors (ESLint + typescript-eslint)
pnpm lint:fix       # Auto-fix lint errors
pnpm format         # Format source files with Prettier
pnpm types:check    # TypeScript type-check without emitting files

# Watch mode
pnpm watch          # TypeScript watch

# MCP Inspector (debug tools interactively)
pnpm inspector
```

This repository requires **Node.js 22.14+** for development, CI, and release tooling.

To run a single test file:
```bash
pnpm vitest run src/services/__tests__/coincap.test.ts
```

## Architecture

This is an MCP (Model Context Protocol) server for cryptocurrency data. It supports two transports:
- **STDIO**: built to `dist/` via `tsc`, entry point `dist/index.js`
- **Streamable HTTP**: built to `dist/` via `tsc`, entry point `dist/http.js`. API key is passed as a query parameter: `/mcp?COINCAP_API_KEY={key}`

### Request flow

```
MCP client → transport (stdio or HTTP) → src/index.ts (createServer)
  → tool handlers in src/tools/ (price.ts, market.ts, historical.ts, top-assets.ts, technical-analysis.ts, rates.ts, exchanges.ts, search-assets.ts, global-metrics.ts, compare.ts, candlestick.ts, price-conversion.ts, asset-info.ts)
    → src/services/coincap.ts (API + in-memory cache)
      → CoinCap v3 API (COINCAP_API_KEY required)
```

### Key design points

- **`src/index.ts`** exports `createServer(config)` (used by Smithery HTTP transport) and also runs STDIO transport when invoked directly as a CLI or when `MCP_TRANSPORT=stdio`.
- **`src/services/coincap.ts`** handles all CoinCap API calls via the v3 API. Requires `COINCAP_API_KEY`. Results are cached in-memory for 60 seconds (`CACHE_TTL`).
- **`src/tools/`** — one file per MCP tool. Each exports a Zod schema (`*Schema`) and a handler (`handle*(args)`). All handlers wrap Zod `.parse()` inside a `try/catch` that returns `isError: true` on validation failures. Tools are registered in `src/index.ts`.
- **`src/services/formatters.ts`** — pure formatting functions for tool output text.
- **`src/types/index.ts`** — shared TypeScript interfaces for CoinCap API responses.

### Thirteen registered MCP tools (category-prefixed naming)

Tools are organized into four categories: `price-*`, `market-*`, `assets-*`, `analysis-*`. All tools declare `outputSchema` and return `structuredContent` alongside formatted text.

| Tool | Handler | API endpoint |
|------|---------|--------------|
| `price-get` | `handleGetPrice` | `/assets` |
| `price-convert` | `handleGetPriceConversion` | `/assets` + `/rates` |
| `market-analysis` | `handleGetMarketAnalysis` | `/assets/{id}/markets` |
| `market-global` | `handleGetGlobalMetrics` | `/assets` (aggregated) |
| `market-rates` | `handleGetRates` | `/rates` and `/rates/{slug}` |
| `market-exchanges` | `handleGetExchanges` | `/exchanges` and `/exchanges/{id}` |
| `assets-top` | `handleGetTopAssets` | `/assets` |
| `assets-search` | `handleSearchAssets` | `/assets?search={query}` |
| `assets-info` | `handleGetAssetInfo` | `/assets` (single lookup) |
| `assets-compare` | `handleCompareCrypto` | `/assets` (multiple lookups) |
| `analysis-historical` | `handleGetHistoricalAnalysis` | `/assets/{id}/history` |
| `analysis-technical` | `handleGetTechnicalAnalysis` | `/ta/{id}/allLatest` |
| `analysis-candlestick` | `handleGetCandlestickData` | `/assets/{id}/candles` |

### Resources

- **`info://server`** — Server name and version metadata
- **`asset://{symbol}`** — Asset information by symbol (e.g. `asset://BTC`), returned as JSON

### Prompts

| Prompt | Args | Description |
|--------|------|-------------|
| `analyze-crypto` | `symbol` | Comprehensive analysis: price, market, historical trends |
| `compare-cryptocurrencies` | `symbols` | Compare 2-5 cryptos side-by-side |
| `market-overview` | — | Global market snapshot: metrics, top assets, top exchanges |
| `crypto-conversion` | `symbol`, `amount?`, `currency?` | Convert crypto amount to fiat |
| `exchange-analysis` | `symbol` | Exchange landscape analysis for a crypto |
| `technical-analysis` | `symbol` | Full technical analysis: indicators, candles, trends |
| `crypto-screener` | `query` | Search and screen cryptos for opportunities |

### Tooling

- **Prettier** — code formatting (`pnpm format`). Config: `.prettierrc`. Ignores: `.prettierignore`.
- **ESLint** — linting with `typescript-eslint` (`pnpm lint`). Config: `eslint.config.js`.

### Releases & commits

Releases are automated via **semantic-release** on push to `main`. Commit messages must follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) to trigger version bumps.

All commits must be **SSH-signed** (verified). The CI workflow enforces this. To sign locally:
```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `COINCAP_API_KEY` | Required. API key for CoinCap v3 API. Free tier available at https://pro.coincap.io/dashboard |
| `MCP_TRANSPORT` | Set to `stdio` to force STDIO transport when running programmatically. |
