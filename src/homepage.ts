import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SERVER_CONFIG } from './config/index.js';

function getLogoDataUrl(): string {
  try {
    const moduleDir = dirname(fileURLToPath(import.meta.url));
    const logoPath = resolve(moduleDir, '../logo.png');
    const logoBuffer = readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch {
    return 'https://raw.githubusercontent.com/truss44/mcp-crypto-price/main/logo.png';
  }
}

export function renderHomepage(): string {
  const logoUrl = getLogoDataUrl();
  const githubUrl = 'https://github.com/truss44/mcp-crypto-price';
  const smitheryUrl = 'https://smithery.ai/servers/truss44/mcp-crypto-price';
  const coincapDocsUrl = 'https://pro.coincap.io/api-docs';
  const coincapMethodologyUrl = 'https://www.coincap.io/methodology';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${SERVER_CONFIG.name} is an MCP server for real-time cryptocurrency prices, market analysis, and historical trends powered by CoinCap." />
    <title>${SERVER_CONFIG.name} | Crypto Market MCP Tool</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #07111f;
        --bg-2: #0b1730;
        --card: rgba(13, 22, 42, 0.82);
        --card-border: rgba(123, 234, 225, 0.16);
        --text: #e5eefc;
        --muted: #9fb0cf;
        --accent: #63f3e5;
        --accent-2: #70a8ff;
        --shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top, rgba(99, 243, 229, 0.15), transparent 28%),
          radial-gradient(circle at 85% 20%, rgba(112, 168, 255, 0.14), transparent 22%),
          linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
      }

      a { color: inherit; }
      .wrap {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
        padding: 32px 0 56px;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
        gap: 24px;
        align-items: center;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border: 1px solid var(--card-border);
        border-radius: 999px;
        background: rgba(255,255,255,0.03);
        color: var(--muted);
        letter-spacing: 0.02em;
      }

      .badge-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        box-shadow: 0 0 24px rgba(99, 243, 229, 0.7);
      }

      h1 {
        margin: 18px 0 12px;
        font-size: clamp(2.4rem, 5vw, 4.8rem);
        line-height: 0.96;
        letter-spacing: -0.05em;
      }

      .lede {
        margin: 0;
        max-width: 60ch;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.7;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 18px;
        border-radius: 16px;
        text-decoration: none;
        font-weight: 700;
        border: 1px solid transparent;
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }

      .button:hover { transform: translateY(-1px); }
      .button.primary {
        background: linear-gradient(135deg, rgba(99,243,229,0.95), rgba(112,168,255,0.95));
        color: #05111c;
      }
      .button.secondary {
        background: rgba(255,255,255,0.03);
        border-color: var(--card-border);
        color: var(--text);
      }

      .hero-card,
      .panel {
        background: var(--card);
        backdrop-filter: blur(18px);
        border: 1px solid var(--card-border);
        border-radius: 28px;
        box-shadow: var(--shadow);
      }

      .hero-card {
        padding: 22px;
        text-align: center;
      }

      .logo {
        width: min(100%, 280px);
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 28px;
        display: block;
        margin: 0 auto;
      }

      .logo-caption {
        margin-top: 16px;
        color: var(--muted);
        font-size: 0.94rem;
      }

      .grid {
        margin-top: 26px;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 18px;
      }

      .panel {
        padding: 22px;
      }

      .span-7 { grid-column: span 7; }
      .span-5 { grid-column: span 5; }
      .span-4 { grid-column: span 4; }
      .span-6 { grid-column: span 6; }

      .section-title {
        margin: 0 0 12px;
        font-size: 1.1rem;
      }

      .list {
        margin: 0;
        padding-left: 18px;
        color: var(--muted);
        line-height: 1.7;
      }

      .metrics {
        display: grid;
        gap: 12px;
      }

      .metric {
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
      }

      .metric strong {
        display: block;
        margin-bottom: 4px;
      }

      .links {
        display: grid;
        gap: 10px;
      }

      .link-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 14px 16px;
        border-radius: 18px;
        text-decoration: none;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
      }

      .link-card span { color: var(--muted); }

      .footer {
        margin-top: 24px;
        padding: 20px 4px 0;
        color: var(--muted);
        font-size: 0.93rem;
        text-align: center;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        background: rgba(255,255,255,0.08);
        padding: 0.18rem 0.38rem;
        border-radius: 8px;
      }

      @media (max-width: 920px) {
        .hero { grid-template-columns: 1fr; }
        .span-7, .span-5, .span-4, .span-6 { grid-column: span 12; }
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="hero">
        <div>
          <div class="badge"><span class="badge-dot"></span><span>MCP cryptocurrency intelligence</span></div>
          <h1>Real-time crypto pricing, market analysis, and historical trend insights.</h1>
          <p class="lede">
            <strong>${SERVER_CONFIG.name}</strong> is a Model Context Protocol tool for exploring cryptocurrency data
            through CoinCap. It delivers current price data, market depth analysis, historical trend summaries,
            and top-asset rankings through a clean MCP interface.
          </p>
          <div class="actions">
            <a class="button primary" href="${smitheryUrl}">Install on Smithery</a>
            <a class="button secondary" href="${githubUrl}">View on GitHub</a>
            <a class="button secondary" href="${coincapDocsUrl}">CoinCap API Docs</a>
          </div>
        </div>
        <aside class="hero-card">
          <img class="logo" src="${logoUrl}" alt="${SERVER_CONFIG.name} logo" />
          <div class="logo-caption">Real-time crypto intelligence, delivered through MCP.</div>
        </aside>
      </section>

      <section class="grid" aria-label="Feature overview">
        <article class="panel span-7">
          <h2 class="section-title">What this MCP tool does</h2>
          <ul class="list">
            <li><strong>Get live crypto prices</strong> with 24-hour change, market cap, and trading volume.</li>
            <li><strong>Analyze market structure</strong> across exchanges to understand liquidity and distribution.</li>
            <li><strong>Review historical movement</strong> with configurable intervals and lookback windows.</li>
            <li><strong>Inspect top assets</strong> ranked by market cap and activity.</li>
            <li><strong>Use it from MCP clients</strong> like Claude, Cursor, or other compatible hosts.</li>
          </ul>
        </article>

        <article class="panel span-5">
          <h2 class="section-title">Install and connect</h2>
          <div class="metrics">
            <div class="metric">
              <strong>Smithery</strong>
              Install or connect via the server listing: <code>smithery.ai/servers/truss44/mcp-crypto-price</code>
            </div>
            <div class="metric">
              <strong>CLI example</strong>
              <code>npx @smithery/cli install mcp-crypto-price --client claude</code>
            </div>
            <div class="metric">
              <strong>Remote endpoint</strong>
              <code>https://&lt;your-host&gt;/mcp</code>
            </div>
          </div>
        </article>

        <article class="panel span-6">
          <h2 class="section-title">Why CoinCap</h2>
          <ul class="list">
            <li>CoinCap provides real-time cryptocurrency market data and exchange information.</li>
            <li>The methodology emphasizes a global view of trading across exchanges.</li>
            <li>Pricing uses exchange volume weighting and outlier detection to reduce noisy data.</li>
            <li>CoinCap rank considers daily trading volume, availability, and market cap.</li>
          </ul>
          <p class="lede" style="margin-top: 14px; font-size: 0.98rem;">
            Learn more at the <a href="${coincapMethodologyUrl}">CoinCap methodology page</a> and the
            <a href="${coincapDocsUrl}">CoinCap API documentation</a>.
          </p>
        </article>

        <article class="panel span-6">
          <h2 class="section-title">Project links</h2>
          <div class="links">
            <a class="link-card" href="${githubUrl}">
              <div>
                <strong>GitHub repository</strong><br />
                <span>Source, issues, and release history</span>
              </div>
              <span>↗</span>
            </a>
            <a class="link-card" href="${smitheryUrl}">
              <div>
                <strong>Smithery server page</strong><br />
                <span>Install and discover this MCP server</span>
              </div>
              <span>↗</span>
            </a>
            <a class="link-card" href="${coincapDocsUrl}">
              <div>
                <strong>CoinCap API docs</strong><br />
                <span>Reference for assets, markets, and API access</span>
              </div>
              <span>↗</span>
            </a>
          </div>
        </article>
      </section>

      <div class="footer">
        Built for MCP clients and crypto researchers who want a fast, structured view of market data.<br />
        Created by Tracey Russell.
      </div>
    </main>
  </body>
</html>`;
}
