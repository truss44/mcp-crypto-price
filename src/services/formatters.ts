import type { CryptoAsset, Market, HistoricalData, TechnicalAnalysis } from '../types/index.js';

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
  const marketCap = (parseFloat(asset.marketCapUsd || '0') / 1000000000).toFixed(2);
  
  return [
    `${asset.name} (${asset.symbol})`,
    `Price: $${price}`,
    `24h Change: ${change}%`,
    `24h Volume: $${volume}M`,
    `Market Cap: $${marketCap}B`,
    `Rank: ${asset.rank != null ? `#${asset.rank}` : 'N/A'}`,
  ].join('\n');
}

export function formatMarketAnalysis(asset: CryptoAsset, markets: Market[]): string {
  const totalVolume = markets.reduce((sum, market) => sum + parseFloat(market.volumeUsd24Hr), 0);
  const topMarkets = markets
    .sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr))
    .slice(0, 5);

  const marketInfo = topMarkets.map(market => {
    const volumePercent = (parseFloat(market.volumeUsd24Hr) / totalVolume * 100).toFixed(2);
    const volume = (parseFloat(market.volumeUsd24Hr) / 1000000).toFixed(2);
    return `${market.exchangeId}: $${formatPrice(parseFloat(market.priceUsd))} (Volume: $${volume}M, ${volumePercent}% of total)`;
  }).join('\n');

  return [
    `Market Analysis for ${asset.name} (${asset.symbol})`,
    `Current Price: $${formatPrice(parseFloat(asset.priceUsd))}`,
    `24h Volume: $${(parseFloat(asset.volumeUsd24Hr || '0') / 1000000).toFixed(2)}M`,
    `VWAP (24h): $${formatPrice(parseFloat(asset.vwap24Hr || '0'))}`,
    '\nTop 5 Markets by Volume:',
    marketInfo
  ].join('\n');
}

export function formatTopAssets(assets: CryptoAsset[]): string {
  const lines = assets.map((asset) => {
    const price = formatPrice(parseFloat(asset.priceUsd));
    const change = parseFloat(asset.changePercent24Hr || '0').toFixed(2);
    const marketCap = (parseFloat(asset.marketCapUsd || '0') / 1000000000).toFixed(2);
    const rankStr = asset.rank != null ? `#${asset.rank} ` : '';
    return `${rankStr}${asset.name} (${asset.symbol}): $${price} (24h: ${change}%, MCap: $${marketCap}B)`;
  });

  return ['Top Cryptocurrencies by Market Cap', '', ...lines].join('\n');
}

export function formatTechnicalAnalysis(asset: CryptoAsset, ta: TechnicalAnalysis): string {
  const price = formatPrice(parseFloat(asset.priceUsd));

  const smaLine = ta.sma
    ? `  SMA (${ta.sma.period}): $${formatPrice(parseFloat(ta.sma.value))}`
    : '  SMA: N/A';

  const emaLine = ta.ema
    ? `  EMA (${ta.ema.period}): $${formatPrice(parseFloat(ta.ema.value))}`
    : '  EMA: N/A';

  const rsiValue = ta.rsi ? parseFloat(ta.rsi.value) : null;
  const rsiSignal = rsiValue === null ? 'N/A' : rsiValue > 70 ? 'Overbought' : rsiValue < 30 ? 'Oversold' : 'Neutral';
  const rsiLine = ta.rsi
    ? `  RSI (${ta.rsi.period}): ${parseFloat(ta.rsi.value).toFixed(2)} (${rsiSignal})`
    : '  RSI: N/A';

  const macdHistogram = ta.macd ? parseFloat(ta.macd.histogram) : null;
  const macdSignalLabel = macdHistogram === null ? '' : macdHistogram > 0 ? ' (Bullish)' : ' (Bearish)';
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

export function formatHistoricalAnalysis(asset: CryptoAsset, history: HistoricalData['data']): string {
  const currentPrice = parseFloat(asset.priceUsd);
  const oldestPrice = parseFloat(history[0].priceUsd);
  const highestPrice = Math.max(...history.map(h => parseFloat(h.priceUsd)));
  const lowestPrice = Math.min(...history.map(h => parseFloat(h.priceUsd)));
  const priceChange = ((currentPrice - oldestPrice) / oldestPrice * 100).toFixed(2);

  return [
    `Historical Analysis for ${asset.name} (${asset.symbol})`,
    `Period High: $${formatPrice(highestPrice)}`,
    `Period Low: $${formatPrice(lowestPrice)}`,
    `Price Change: ${priceChange}%`,
    `Current Price: $${formatPrice(currentPrice)}`,
    `Starting Price: $${formatPrice(oldestPrice)}`,
    '\nVolatility Analysis:',
    `Price Range: $${formatPrice(highestPrice - lowestPrice)}`,
    `Range Percentage: ${((highestPrice - lowestPrice) / lowestPrice * 100).toFixed(2)}%`
  ].join('\n');
}