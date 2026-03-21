# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (HTTP server with hot reload via Smithery CLI)
npm run dev

# Build
npm run build          # HTTP bundle → .smithery/index.cjs
npm run build:stdio    # STDIO bundle → dist/

# Run
npm run start:http     # Start HTTP server
npm run start:stdio    # Start STDIO server

# Test
npm test               # Run all tests
npm run test:coverage  # Run tests with coverage

# Watch mode
npm run watch          # TypeScript watch

# MCP Inspector (debug tools interactively)
npm run inspector
```

To run a single test file:
```bash
NODE_OPTIONS='--experimental-vm-modules --no-warnings' npx jest src/services/__tests__/coincap.test.ts
```

## Architecture

This is an MCP (Model Context Protocol) server for cryptocurrency data. It supports two transports:
- **STDIO**: built to `dist/` via `tsc`, entry point `dist/index.js`
- **Streamable HTTP**: built to `.smithery/index.cjs` via Smithery CLI

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

### Three registered MCP tools

| Tool | Handler | API endpoint |
|------|---------|--------------|
| `get-crypto-price` | `handleGetPrice` | `/assets` |
| `get-market-analysis` | `handleGetMarketAnalysis` | `/assets/{id}/markets` |
| `get-historical-analysis` | `handleGetHistoricalAnalysis` | `/assets/{id}/history` |

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
