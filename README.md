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
- Release workflow signs commits via SSH for Verified releases
- Smithery CLI scripts to build and run the HTTP server

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

### Run as Streamable HTTP server

You can run the server over HTTP for environments that support MCP over HTTP streaming.

- Dev server (recommended during development):

```bash
npm run dev
```

- Build and run the HTTP server:

```bash
# Build (outputs to dist/)
npm run build

# Start the HTTP server
npm run start:http
```

- Build and run the STDIO server:

```bash
# Build (outputs to dist/)
npm run build

# Start the STDIO server
npm run start:stdio
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

This MCP server works directly via `npx` (configs above) and does not require Smithery.

If you do use the Smithery CLI, authenticate with `smithery auth login` or by setting `SMITHERY_API_KEY` in your environment. Recent versions of the Smithery CLI do not support passing API keys via `--key` (or older `--profile` patterns).

Launch Claude Desktop to start using the crypto analysis tools.

## Verified commits & SSH signing

This repository requires Verified (cryptographically signed) commits. CI also includes a job (`Verify commit signatures`) that fails PRs with unsigned commits.

### Create an SSH signing key (once)

```bash
# Generate a new ed25519 SSH key (no passphrase makes CI easier)
ssh-keygen -t ed25519 -C "CI signing key for mcp-crypto-price" -f ~/.ssh/id_ed25519 -N ''

# Your keys will be at:
#   Private: ~/.ssh/id_ed25519
#   Public : ~/.ssh/id_ed25519.pub
```

### Enable SSH signing locally (optional but recommended)

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# Example signed commit
git commit -S -m 'feat: add something'
```

### Configure GitHub to verify your signatures

1. Add your public key as an SSH Signing Key in your GitHub account:
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Key type: Signing Key (SSH)
   - Paste contents of `~/.ssh/id_ed25519.pub`

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

## Sample Prompts

- "What's the current price of Bitcoin?"
- "Show me market analysis for ETH"
- "Give me the 7-day price history for DOGE"
- "What are the top exchanges trading BTC?"
- "Show me the price trends for SOL with 1-hour intervals"

## Project Inspiration

This project was inspired by Alex Andru's [coincap-mcp](https://github.com/QuantGeekDev/coincap-mcp) project.

## License

This project is licensed under the MIT License
