# Crypto Price & Market Analysis MCP Server
[![smithery badge](https://smithery.ai/badge/@truss44/mcp-crypto-price)](https://smithery.ai/server/@truss44/mcp-crypto-price) [![NPM Downloads](https://img.shields.io/npm/d18m/mcp-crypto-price)](https://www.npmjs.com/package/mcp-crypto-price)

<a href="https://glama.ai/mcp/servers/jpqoejojnc">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/jpqoejojnc/badge" />
</a>

A Model Context Protocol (MCP) server that provides comprehensive cryptocurrency analysis using the CoinCap API. This server offers real-time price data, market analysis, and historical trends through an easy-to-use interface. Supports both STDIO and Streamable HTTP transports.

## What's New

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
      "args": ["-y", "mcp-crypto-price"]
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
# Build the HTTP bundle (outputs to .smithery/)
npm run build

# Start the HTTP server
npm run start:http
```

- Build and run the STDIO server:

```bash
# Build the STDIO bundle (outputs to dist/)
npm run build:stdio

# Start the STDIO server
npm run start:stdio
```

The dev/build commands will print the server address to the console. Use that URL in clients that support MCP over HTTP (for example, Smithery). You can optionally provide an API key via `COINCAP_API_KEY` for higher rate limits.

## Optional: CoinCap API Key

For higher rate limits, add an API key to your configuration:

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

> **Important Note**: CoinCap is sunsetting their v2 API. This MCP supports both v2 and v3 APIs:
> - If you provide a `COINCAP_API_KEY`, it will attempt to use the v3 API first, falling back to v2 if necessary
> - Without an API key, it will use the v2 API (which will eventually be discontinued)
> - It's recommended to obtain an API key from [pro.coincap.io/dashboard](https://pro.coincap.io/dashboard) as the v2 API will be completely deactivated in the future

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
