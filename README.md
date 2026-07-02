# Crypto Price & Market Analysis MCP Server
[![smithery badge](https://smithery.ai/badge/@truss44/mcp-crypto-price)](https://smithery.ai/server/@truss44/mcp-crypto-price) [![NPM Downloads](https://img.shields.io/npm/d18m/mcp-crypto-price)](https://www.npmjs.com/package/mcp-crypto-price)

<a href="https://glama.ai/mcp/servers/jpqoejojnc">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/jpqoejojnc/badge" />
</a>

A Model Context Protocol (MCP) server that provides comprehensive cryptocurrency analysis using the CoinCap API. This server offers real-time price data, market analysis, and historical trends through an easy-to-use interface. Supports both STDIO and Streamable HTTP transports.

## Requirements

- **Node.js 22.14+**
- **CoinCap API key** via `COINCAP_API_KEY`

## What's New

- **BREAKING**: CoinCap v2 API removed. Now uses v3 API exclusively. A `COINCAP_API_KEY` is required (free tier available at [pro.coincap.io/dashboard](https://pro.coincap.io/dashboard))
- Streamable HTTP transport added (while keeping STDIO compatibility)
- Smithery CLI scripts to build and run the HTTP server
- **6 new tools**: `search-assets`, `get-global-metrics`, `compare-crypto`, `get-candlestick-data`, `get-price-conversion`, `get-asset-info`
- **MCP best practices**: `isError` flag on validation errors, server description, and `asset://{symbol}` resource template

## Usage

Add this configuration to your Claude Desktop config file:

- **MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-crypto-price": {
      "command": "npx",
      "args": ["-y", "mcp-crypto-price"],
      "env": {
        "COINCAP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

If your MCP client requires launching via `cmd.exe` on Windows:

```json
{
  "mcpServers": {
    "mcp-crypto-price": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "mcp-crypto-price"],
      "env": {
        "COINCAP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Development scripts

```bash
pnpm dev          # Development (HTTP server with hot reload via Smithery CLI)
pnpm build         # Compile TypeScript → dist/
pnpm format        # Format source files with Prettier
pnpm lint          # Check for lint errors (ESLint + typescript-eslint)
pnpm lint:fix      # Auto-fix lint errors
pnpm types:check   # TypeScript type-check without emitting files
pnpm test          # Run all tests with Vitest
pnpm test:coverage # Run tests with coverage report (Vitest)
pnpm inspector     # Open MCP inspector for interactive debugging
```

### Run as Streamable HTTP server

You can run the server over HTTP for environments that support MCP over HTTP streaming.

- Dev server (recommended during development):

```bash
pnpm dev
```

- Build and run the HTTP server:

```bash
# Build (outputs to dist/)
pnpm build

# Start the HTTP server
pnpm start:http
```

- Build and run the STDIO server:

```bash
# Build (outputs to dist/)
pnpm build

# Start the STDIO server
pnpm start:stdio
```

The server listens on port 3000 by default (override with `PORT`). For clients that connect over HTTP (e.g. Smithery, Claude.ai), pass your API key as a query parameter:

```
http://localhost:3000/mcp?COINCAP_API_KEY=YOUR_API_KEY_HERE
```

For remote deployments:

```
https://mcp-crypto-price.codemonkeyinnovations.com/mcp?COINCAP_API_KEY=YOUR_API_KEY_HERE
```

## Required: CoinCap API Key

This server uses the CoinCap v3 API, which requires an API key. A **free tier** is available.

1. Sign up and get your API key at [pro.coincap.io/dashboard](https://pro.coincap.io/dashboard)
2. Add the key to your MCP client configuration:
   - **STDIO**: via the `COINCAP_API_KEY` environment variable (see Usage examples above)
   - **HTTP**: via the `COINCAP_API_KEY` query parameter in the connection URL (e.g. `/mcp?COINCAP_API_KEY=your_key`)

Without a valid API key, all tools will return an error with instructions on how to obtain one.

## Note for Smithery CLI users

This MCP server works directly via `pnpm dlx` (configs above) and does not require Smithery.

If you do use the Smithery CLI, authenticate with `smithery auth login` or by setting `SMITHERY_API_KEY` in your environment. Recent versions of the Smithery CLI do not support passing API keys via `--key` (or older `--profile` patterns).

Launch Claude Desktop to start using the crypto analysis tools.

## Tools

#### get-crypto-price

Gets current price and 24h stats for any cryptocurrency, including:
- Current price in USD
- 24-hour price change
- Trading volume
- Market cap
- Market rank

#### get-market-analysis

Provides detailed market analysis including:
- Top 5 exchanges by volume
- Price variations across exchanges
- Volume distribution analysis
- VWAP (Volume Weighted Average Price)

#### get-historical-analysis

Analyzes historical price data with:
- Customizable time intervals (5min to 1 day)
- Support for up to 30 days of historical data
- Price trend analysis
- Volatility metrics
- High/low price ranges

#### get-top-assets

Lists top cryptocurrencies ranked by market cap, including:
- Current price in USD
- 24-hour price change
- Market cap and rank
- Configurable result count (1–50, default 10)

#### get-technical-analysis

Returns the latest technical indicators for any cryptocurrency:
- SMA (Simple Moving Average) with period
- EMA (Exponential Moving Average) with period
- RSI (Relative Strength Index) with Overbought/Oversold/Neutral signal
- MACD with signal line, histogram, and Bullish/Bearish label
- VWAP (Volume Weighted Average Price, 24h)

#### get-rates

Returns USD-based conversion rates for fiat currencies and cryptocurrencies:
- All fiat currency rates (USD base)
- Top 10 cryptocurrency rates
- Optional `slug` parameter (e.g. `euro`, `bitcoin`) for a single rate lookup

#### get-exchanges

Lists top cryptocurrency exchanges ranked by 24h volume:
- Exchange name, rank, and 24h volume in USD
- Number of trading pairs and market share percentage
- Optional `exchangeId` parameter (e.g. `binance`) for single exchange details
- Optional `limit` parameter (1–50, default 10)

#### search-assets

Searches for cryptocurrencies by name or symbol with fuzzy matching:
- Returns matching assets with symbol, name, price, and rank
- Configurable result count (1–50, default 10)
- Example: search "bit" returns Bitcoin, Bitcoin Cash, BitTorrent, etc.

#### get-global-metrics

Provides an overview of the entire cryptocurrency market:
- Total market capitalization across all assets
- 24-hour trading volume
- Number of active cryptocurrencies
- Bitcoin dominance percentage
- Top gainers and losers

#### compare-crypto

Compares 2–5 cryptocurrencies side by side:
- Price, 24h change, market cap, volume, and rank for each asset
- Comma-separated symbols (e.g. `BTC,ETH,SOL`)
- Highlights best performer by 24h change

#### get-candlestick-data

Retrieves OHLCV candlestick data from a specific exchange:
- Open, high, low, close, and volume for each candle
- Configurable exchange (e.g. `binance`), quote currency (e.g. `usd`), and interval (`5m`, `15m`, `1h`, `6h`, `1d`)
- Supports 1–30 days of historical candles

#### get-price-conversion

Converts a cryptocurrency amount into any fiat currency:
- Uses real-time price data and USD-based exchange rates
- Parameters: `symbol` (e.g. `BTC`), `amount` (default 1), `currency` (default `usd`)
- Example: 2.5 BTC in EUR

#### get-asset-info

Returns detailed metadata for a single cryptocurrency:
- ID, rank, symbol, and name
- Price, 24h change, market cap, and volume
- Circulating supply and max supply
- VWAP (24h)

## Resources

The server exposes the following MCP resources:

- **`info://server`** — Server name and version metadata
- **`asset://{symbol}`** — Cryptocurrency asset information by symbol (e.g. `asset://BTC`), returned as JSON

## Prompts

The server exposes the following MCP prompts that clients can invoke:

| Prompt | Args | Description |
|--------|------|-------------|
| `analyze-crypto` | `symbol` | Comprehensive analysis: price, market, historical trends |
| `compare-cryptocurrencies` | `symbols` | Compare 2-5 cryptos side-by-side |
| `market-overview` | — | Global market snapshot: metrics, top assets, top exchanges |
| `crypto-conversion` | `symbol`, `amount?`, `currency?` | Convert crypto amount to fiat |
| `exchange-analysis` | `symbol` | Exchange landscape analysis for a crypto |
| `technical-analysis` | `symbol` | Full technical analysis: indicators, candles, trends |
| `crypto-screener` | `query` | Search and screen cryptos for opportunities |

## Sample Prompts

- "What's the current price of Bitcoin?"
- "Show me market analysis for ETH"
- "Give me the 7-day price history for DOGE"
- "What are the top exchanges trading BTC?"
- "Show me the price trends for SOL with 1-hour intervals"
- "What are the technical indicators for ETH right now?"
- "What's the current EUR to USD exchange rate?"
- "Which crypto exchanges have the highest 24h volume?"
- "Search for cryptocurrencies matching 'sol'"
- "Give me a global overview of the crypto market"
- "Compare BTC, ETH, and SOL side by side"
- "Show me 1-hour candlestick data for BTC on Binance over the last 3 days"
- "Convert 2.5 BTC to EUR"
- "Get detailed info about the Ethereum asset"
- "Generate a comprehensive analysis of a cryptocurrency covering price, market, and historical trends"
- "Find all cryptocurrencies with 'bit' in their name and show me their current prices"
- "What's the market cap ranking and circulating supply of Cardano?"
- "Compare the top 3 stablecoins and show which has the highest volume"
- "Show me how Bitcoin has performed over the past 30 days with daily candles"
- "Convert 100 SOL to GBP and show the exchange rate"
- "Give me a full market snapshot: global metrics, top gainers, and BTC dominance"
- "What are the best and worst performing cryptos in the last 24 hours?"
- "Show me 15-minute candlestick data for ETH on Coinbase over the last 2 days"
- "Compare DeFi tokens: UNI, AAVE, COMP, and MKR"
- "What's the VWAP and max supply of Bitcoin?"
- "Search for layer-2 tokens and compare the top results"

## License

This project is licensed under the MIT License
