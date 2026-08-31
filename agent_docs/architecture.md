# Architecture

MCP (Model Context Protocol) server for cryptocurrency data via CoinCap v3 API. Two transports:
- **STDIO** — built to `dist/` via `tsc`, entry `dist/index.js`
- **Streamable HTTP** — built to `dist/` via `tsc`, entry `dist/http.js`. API key passed as query param: `/mcp?COINCAP_API_KEY={key}`

## Request flow

```
MCP client → transport (stdio or HTTP) → src/index.ts (createServer)
  → tool handlers in src/tools/
    → src/services/coincap.ts (API + in-memory cache)
      → CoinCap v3 API (COINCAP_API_KEY required)
```

## Key design points

- **`src/index.ts`** exports `createServer(config)` (used by Smithery HTTP transport); runs STDIO when invoked as CLI or when `MCP_TRANSPORT=stdio`.
- **`src/services/coincap.ts`** — all CoinCap v3 API calls. Requires `COINCAP_API_KEY`. Results cached in-memory 60s (`CACHE_TTL`).
- **`src/tools/`** — one file per MCP tool. Each exports a Zod schema (`*Schema`) and handler (`handle*(args)`). Handlers wrap Zod `.parse()` in `try/catch` returning `isError: true` on validation failures. Registered in `src/index.ts`.
- **`src/services/formatters.ts`** — pure formatting functions for tool output text.
- **`src/services/schemas.ts`** — shared Zod schemas.
- **`src/types/index.ts`** — shared TypeScript interfaces for CoinCap API responses.
- **`src/config/index.ts`** — configuration loading.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `COINCAP_API_KEY` | Required. CoinCap v3 API key. Free tier: https://pro.coincap.io/dashboard |
| `MCP_TRANSPORT` | Set to `stdio` to force STDIO transport when run programmatically. |
