import type { CryptoAsset, Market, HistoricalData, Rate } from '../types/index.js';

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

export function formatRates(rates: Rate[]): string {
  const fiatRates = rates.filter(r => r.type === 'fiat');
  const cryptoRates = rates.filter(r => r.type === 'crypto');

  const fiatLines = fiatRates.map(r => {
    const symbol = r.currencySymbol ? ` ${r.currencySymbol}` : '';
    const rate = parseFloat(r.rateUsd);
    return `  ${r.symbol}${symbol}: $${rate < 1 ? rate.toFixed(6) : rate.toFixed(4)} USD`;
  });

  const cryptoLines = cryptoRates.slice(0, 10).map(r => {
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
  const symbolLabel = rate.currencySymbol ? `${rate.symbol}  ${rate.currencySymbol}` : rate.symbol;
  const rateValue = parseFloat(rate.rateUsd);
  const formattedRate = rateValue < 1 ? rateValue.toFixed(6) : formatPrice(rateValue);
  const name = rate.id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return [
    `Rate: ${name} (${rate.symbol})`,
    `Symbol: ${symbolLabel}`,
    `Type: ${rate.type}`,
    `Rate: $${formattedRate} USD`,
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