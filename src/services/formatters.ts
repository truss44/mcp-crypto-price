import type {
  CryptoAsset,
  Exchange,
  HistoricalData,
  Market,
  Rate,
  TechnicalAnalysis,
} from '../types/index.js';

function formatPrice(value: number): string {
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(6);
  return value.toFixed(8);
}

export function formatPriceInfo(asset: CryptoAsset): string {
  const price = formatPrice(parseFloat(asset.priceUsd));
  const change = parseFloat(asset.changePercent24Hr || '0').toFixed(2);
  const volume = (parseFloat(asset.volumeUsd24Hr || '0') / 1000000).toFixed(2);
  const marketCap = (
    parseFloat(asset.marketCapUsd || '0') / 1000000000
  ).toFixed(2);

  return [
    `${asset.name} (${asset.symbol})`,
    `Price: $${price}`,
    `24h Change: ${change}%`,
    `24h Volume: $${volume}M`,
    `Market Cap: $${marketCap}B`,
    `Rank: ${asset.rank != null ? `#${asset.rank}` : 'N/A'}`,
  ].join('\n');
}

export function formatMarketAnalysis(
  asset: CryptoAsset,
  markets: Market[]
): string {
  const totalVolume = markets.reduce(
    (sum, market) => sum + parseFloat(market.volumeUsd24Hr),
    0
  );
  const topMarkets = markets
    .sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr))
    .slice(0, 5);

  const marketInfo = topMarkets
    .map((market) => {
      const volumePercent = (
        (parseFloat(market.volumeUsd24Hr) / totalVolume) *
        100
      ).toFixed(2);
      const volume = (parseFloat(market.volumeUsd24Hr) / 1000000).toFixed(2);
      return `${market.exchangeId}: $${formatPrice(parseFloat(market.priceUsd))} (Volume: $${volume}M, ${volumePercent}% of total)`;
    })
    .join('\n');

  return [
    `Market Analysis for ${asset.name} (${asset.symbol})`,
    `Current Price: $${formatPrice(parseFloat(asset.priceUsd))}`,
    `24h Volume: $${(parseFloat(asset.volumeUsd24Hr || '0') / 1000000).toFixed(2)}M`,
    `VWAP (24h): $${formatPrice(parseFloat(asset.vwap24Hr || '0'))}`,
    '\nTop 5 Markets by Volume:',
    marketInfo,
  ].join('\n');
}

export function formatTopAssets(assets: CryptoAsset[]): string {
  const lines = assets.map((asset) => {
    const price = formatPrice(parseFloat(asset.priceUsd));
    const change = parseFloat(asset.changePercent24Hr || '0').toFixed(2);
    const marketCap = (
      parseFloat(asset.marketCapUsd || '0') / 1000000000
    ).toFixed(2);
    const rankStr = asset.rank != null ? `#${asset.rank} ` : '';
    return `${rankStr}${asset.name} (${asset.symbol}): $${price} (24h: ${change}%, MCap: $${marketCap}B)`;
  });

  return ['Top Cryptocurrencies by Market Cap', '', ...lines].join('\n');
}

export function formatTechnicalAnalysis(
  asset: CryptoAsset,
  ta: TechnicalAnalysis
): string {
  const price = formatPrice(parseFloat(asset.priceUsd));

  const smaLine = ta.sma
    ? `  SMA (${ta.sma.period}): $${formatPrice(parseFloat(ta.sma.value))}`
    : '  SMA: N/A';

  const emaLine = ta.ema
    ? `  EMA (${ta.ema.period}): $${formatPrice(parseFloat(ta.ema.value))}`
    : '  EMA: N/A';

  const rsiValue = ta.rsi ? parseFloat(ta.rsi.value) : null;
  const rsiSignal =
    rsiValue === null
      ? 'N/A'
      : rsiValue > 70
        ? 'Overbought'
        : rsiValue < 30
          ? 'Oversold'
          : 'Neutral';
  const rsiLine = ta.rsi
    ? `  RSI (${ta.rsi.period}): ${parseFloat(ta.rsi.value).toFixed(2)} (${rsiSignal})`
    : '  RSI: N/A';

  const macdHistogram = ta.macd ? parseFloat(ta.macd.histogram) : null;
  const macdSignalLabel =
    macdHistogram === null
      ? ''
      : macdHistogram > 0
        ? ' (Bullish)'
        : ' (Bearish)';
  const macdLines = ta.macd
    ? [
        `  Value: ${formatPrice(parseFloat(ta.macd.value))}`,
        `  Signal: ${formatPrice(parseFloat(ta.macd.signal))}`,
        `  Histogram: ${formatPrice(Math.abs(macdHistogram!))}${macdSignalLabel}`,
      ].join('\n')
    : '  MACD: N/A';

  const vwapLine = ta.vwap
    ? `  VWAP (24h): $${formatPrice(parseFloat(ta.vwap.value))}`
    : '  VWAP: N/A';

  return [
    `Technical Analysis: ${asset.name} (${asset.symbol})`,
    `Current Price: $${price}`,
    '',
    'Moving Averages:',
    smaLine,
    emaLine,
    '',
    'Momentum:',
    rsiLine,
    '',
    'MACD:',
    macdLines,
    '',
    'Volume:',
    vwapLine,
  ].join('\n');
}

export function formatRates(rates: Rate[]): string {
  const fiatRates = rates.filter((r) => r.type === 'fiat');
  const cryptoRates = rates.filter((r) => r.type === 'crypto');

  const fiatLines = fiatRates.map((r) => {
    const symbol = r.currencySymbol ? ` ${r.currencySymbol}` : '';
    const rate = parseFloat(r.rateUsd);
    return `  ${r.symbol}${symbol}: $${rate < 1 ? rate.toFixed(6) : rate.toFixed(4)} USD`;
  });

  const cryptoLines = cryptoRates.slice(0, 10).map((r) => {
    const rate = parseFloat(r.rateUsd);
    return `  ${r.symbol}: $${formatPrice(rate)} USD`;
  });

  return [
    'Currency Conversion Rates (USD Base)',
    '',
    'Fiat Currencies:',
    ...fiatLines,
    '',
    'Crypto Rates (Top 10):',
    ...cryptoLines,
  ].join('\n');
}

export function formatRate(rate: Rate): string {
  const symbolLabel = rate.currencySymbol
    ? `${rate.symbol}  ${rate.currencySymbol}`
    : rate.symbol;
  const rateValue = parseFloat(rate.rateUsd);
  const formattedRate =
    rateValue < 1 ? rateValue.toFixed(6) : formatPrice(rateValue);
  const name = rate.id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return [
    `Rate: ${name} (${rate.symbol})`,
    `Symbol: ${symbolLabel}`,
    `Type: ${rate.type}`,
    `Rate: $${formattedRate} USD`,
  ].join('\n');
}

export function formatExchanges(exchanges: Exchange[]): string {
  const lines = exchanges.map((ex) => {
    const rank = ex.rank ? `#${ex.rank}` : 'N/A';
    const volume = ex.volumeUsd
      ? `$${(parseFloat(ex.volumeUsd) / 1_000_000_000).toFixed(2)}B`
      : 'N/A';
    const pairs = ex.tradingPairs ?? 'N/A';
    const pct = ex.percentTotalVolume
      ? `${parseFloat(ex.percentTotalVolume).toFixed(2)}% of total`
      : '';
    const ws = ex.socket ? '  WS' : '';
    return `${rank.padEnd(4)} ${ex.name.padEnd(20)} ${volume.padEnd(12)} ${pairs} pairs${ws}  ${pct}`;
  });

  return ['Top Cryptocurrency Exchanges by Volume', '', ...lines].join('\n');
}

export function formatExchange(exchange: Exchange): string {
  const volume = exchange.volumeUsd
    ? `$${(parseFloat(exchange.volumeUsd) / 1_000_000_000).toFixed(2)}B USD`
    : 'N/A';
  const pairs = exchange.tradingPairs ?? 'N/A';
  const pct = exchange.percentTotalVolume
    ? `${parseFloat(exchange.percentTotalVolume).toFixed(2)}%`
    : 'N/A';
  const ws = exchange.socket === null ? 'N/A' : exchange.socket ? 'Yes' : 'No';

  return [
    `Exchange: ${exchange.name}`,
    `Rank: #${exchange.rank}`,
    `24h Volume: ${volume}`,
    `Trading Pairs: ${pairs}`,
    `% of Total Volume: ${pct}`,
    `WebSocket: ${ws}`,
  ].join('\n');
}

export function formatHistoricalAnalysis(
  asset: CryptoAsset,
  history: HistoricalData['data']
): string {
  const currentPrice = parseFloat(asset.priceUsd);
  const oldestPrice = parseFloat(history[0].priceUsd);
  const highestPrice = Math.max(...history.map((h) => parseFloat(h.priceUsd)));
  const lowestPrice = Math.min(...history.map((h) => parseFloat(h.priceUsd)));
  const priceChange = (
    ((currentPrice - oldestPrice) / oldestPrice) *
    100
  ).toFixed(2);

  return [
    `Historical Analysis for ${asset.name} (${asset.symbol})`,
    `Period High: $${formatPrice(highestPrice)}`,
    `Period Low: $${formatPrice(lowestPrice)}`,
    `Price Change: ${priceChange}%`,
    `Current Price: $${formatPrice(currentPrice)}`,
    `Starting Price: $${formatPrice(oldestPrice)}`,
    '\nVolatility Analysis:',
    `Price Range: $${formatPrice(highestPrice - lowestPrice)}`,
    `Range Percentage: ${(((highestPrice - lowestPrice) / lowestPrice) * 100).toFixed(2)}%`,
  ].join('\n');
}
