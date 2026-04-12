# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (HTTP server with hot reload via Smithery CLI)
npm run dev

# Build
npm run build          # Compile TypeScript → dist/

# Run
npm run start:http     # Start HTTP server (dist/http.js)
npm run start:stdio    # Start STDIO server (dist/index.js)

# Test
npm test               # Run all tests
npm run test:coverage  # Run tests with coverage

# Lint & Format
npm run lint           # Check for lint errors (ESLint + typescript-eslint)
npm run lint:fix       # Auto-fix lint errors
npm run format         # Format source files with Prettier
npm run types:check    # TypeScript type-check without emitting files

# Watch mode
npm run watch          # TypeScript watch

# MCP Inspector (debug tools interactively)
npm run inspector
```

This repository requires **Node.js 22.14+** for development, CI, and release tooling.

To run a single test file:
```bash
NODE_OPTIONS='--experimental-vm-modules --no-warnings' npx jest src/services/__tests__/coincap.test.ts
```

## Architecture

This is an MCP (Model Context Protocol) server for cryptocurrency data. It supports two transports:
- **STDIO**: built to `dist/` via `tsc`, entry point `dist/index.js`
- **Streamable HTTP**: built to `dist/` via `tsc`, entry point `dist/http.js`. API key is passed as a query parameter: `/mcp?COINCAP_API_KEY={key}`

### Request flow

```
MCP client → transport (stdio or HTTP) → src/index.ts (createServer)
  → tool handlers in src/tools/ (price.ts, market.ts, historical.ts)
    → src/services/coincap.ts (API + in-memory cache)
      → CoinCap v3 API (COINCAP_API_KEY required)
```

### Key design points

- **`src/index.ts`** exports `createServer(config)` (used by Smithery HTTP transport) and also runs STDIO transport when invoked directly as a CLI or when `MCP_TRANSPORT=stdio`.
- **`src/services/coincap.ts`** handles all CoinCap API calls via the v3 API. Requires `COINCAP_API_KEY`. Results are cached in-memory for 60 seconds (`CACHE_TTL`).
- **`src/tools/`** — one file per MCP tool. Each exports a Zod schema (`*Schema`) and a handler (`handle*(args)`). Tools are registered in `src/index.ts`.
- **`src/services/formatters.ts`** — pure formatting functions for tool output text.
- **`src/types/index.ts`** — shared TypeScript interfaces for CoinCap API responses.

### Seven registered MCP tools (kebab-case naming)

| Tool | Handler | API endpoint |
|------|---------|--------------|
| `get-crypto-price` | `handleGetPrice` | `/assets` |
| `get-market-analysis` | `handleGetMarketAnalysis` | `/assets/{id}/markets` |
| `get-historical-analysis` | `handleGetHistoricalAnalysis` | `/assets/{id}/history` |
| `get-top-assets` | `handleGetTopAssets` | `/assets` |
| `get-technical-analysis` | `handleGetTechnicalAnalysis` | `/ta/{id}/allLatest` |
| `get-rates` | `handleGetRates` | `/rates` and `/rates/{slug}` |
| `get-exchanges` | `handleGetExchanges` | `/exchanges` and `/exchanges/{id}` |

### Tooling

- **Prettier** — code formatting (`npm run format`). Config: `.prettierrc`. Ignores: `.prettierignore`.
- **ESLint** — linting with `typescript-eslint` (`npm run lint`). Config: `eslint.config.js`.

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
