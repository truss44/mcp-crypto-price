import type { CryptoAsset, Market, HistoricalData } from '../types/index.js';

function formatPrice(value: number): string {
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(6);
  return value.toFixed(8);
}

export function formatPriceInfo(asset: CryptoAsset): string {
  const price = formatPrice(parseFloat(asset.priceUsd));
  const change = parseFloat(asset.changePercent24Hr).toFixed(2);
  const volume = (parseFloat(asset.volumeUsd24Hr) / 1000000).toFixed(2);
  const marketCap = (parseFloat(asset.marketCapUsd) / 1000000000).toFixed(2);
  
  return [
    `${asset.name} (${asset.symbol})`,
    `Price: $${price}`,
    `24h Change: ${change}%`,
    `24h Volume: $${volume}M`,
    `Market Cap: $${marketCap}B`,
    `Rank: #${asset.rank}`,
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
    `24h Volume: $${(parseFloat(asset.volumeUsd24Hr) / 1000000).toFixed(2)}M`,
    `VWAP (24h): $${formatPrice(parseFloat(asset.vwap24Hr || '0'))}`,
    '\nTop 5 Markets by Volume:',
    marketInfo
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