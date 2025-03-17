export function formatPriceInfo(asset) {
    const price = parseFloat(asset.priceUsd).toFixed(2);
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
export function formatMarketAnalysis(asset, markets) {
    const totalVolume = markets.reduce((sum, market) => sum + parseFloat(market.volumeUsd24Hr), 0);
    const topMarkets = markets
        .sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr))
        .slice(0, 5);
    const marketInfo = topMarkets.map(market => {
        const volumePercent = (parseFloat(market.volumeUsd24Hr) / totalVolume * 100).toFixed(2);
        const volume = (parseFloat(market.volumeUsd24Hr) / 1000000).toFixed(2);
        return `${market.exchangeId}: $${market.priceUsd} (Volume: $${volume}M, ${volumePercent}% of total)`;
    }).join('\n');
    return [
        `Market Analysis for ${asset.name} (${asset.symbol})`,
        `Current Price: $${parseFloat(asset.priceUsd).toFixed(2)}`,
        `24h Volume: $${(parseFloat(asset.volumeUsd24Hr) / 1000000).toFixed(2)}M`,
        `VWAP (24h): $${parseFloat(asset.vwap24Hr || '0').toFixed(2)}`,
        '\nTop 5 Markets by Volume:',
        marketInfo
    ].join('\n');
}
export function formatHistoricalAnalysis(asset, history) {
    const currentPrice = parseFloat(asset.priceUsd);
    const oldestPrice = parseFloat(history[0].priceUsd);
    const highestPrice = Math.max(...history.map(h => parseFloat(h.priceUsd)));
    const lowestPrice = Math.min(...history.map(h => parseFloat(h.priceUsd)));
    const priceChange = ((currentPrice - oldestPrice) / oldestPrice * 100).toFixed(2);
    return [
        `Historical Analysis for ${asset.name} (${asset.symbol})`,
        `Period High: $${highestPrice.toFixed(2)}`,
        `Period Low: $${lowestPrice.toFixed(2)}`,
        `Price Change: ${priceChange}%`,
        `Current Price: $${currentPrice.toFixed(2)}`,
        `Starting Price: $${oldestPrice.toFixed(2)}`,
        '\nVolatility Analysis:',
        `Price Range: $${(highestPrice - lowestPrice).toFixed(2)}`,
        `Range Percentage: ${((highestPrice - lowestPrice) / lowestPrice * 100).toFixed(2)}%`
    ].join('\n');
}
