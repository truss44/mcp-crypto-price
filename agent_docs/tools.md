# MCP Tools, Resources & Prompts

## Thirteen registered tools (category-prefixed)

Categories: `price-*`, `market-*`, `assets-*`, `analysis-*`. All tools declare `outputSchema` and return `structuredContent` alongside formatted text.

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
| `analysis-candlestick` | `handleGetCandlestickData` | `/ta/{id}/candlesticks` |

## Resources

- **`info://server`** — Server name and version metadata
- **`asset://{symbol}`** — Asset info by symbol (e.g. `asset://BTC`), returned as JSON

## Prompts

| Prompt | Args | Description |
|--------|------|-------------|
| `analyze-crypto` | `symbol` | Comprehensive analysis: price, market, historical trends |
| `compare-cryptocurrencies` | `symbols` | Compare 2-5 cryptos side-by-side |
| `market-overview` | — | Global market snapshot: metrics, top assets, top exchanges |
| `crypto-conversion` | `symbol`, `amount?`, `currency?` | Convert crypto amount to fiat |
| `exchange-analysis` | `symbol` | Exchange landscape analysis for a crypto |
| `technical-analysis` | `symbol` | Full technical analysis: indicators, candles, trends |
| `crypto-screener` | `query` | Search and screen cryptos for opportunities |
