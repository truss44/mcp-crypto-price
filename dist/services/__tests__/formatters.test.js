import { formatPriceInfo, formatMarketAnalysis, formatHistoricalAnalysis } from '../formatters.js';
describe('Formatters', () => {
    describe('formatPriceInfo', () => {
        it('should format price info correctly', () => {
            const asset = {
                id: 'bitcoin',
                rank: '1',
                symbol: 'BTC',
                name: 'Bitcoin',
                priceUsd: '50000.00',
                changePercent24Hr: '5.25',
                volumeUsd24Hr: '30000000000',
                marketCapUsd: '1000000000000',
                supply: '19000000',
                maxSupply: '21000000',
                vwap24Hr: '49500.00'
            };
            const formatted = formatPriceInfo(asset);
            expect(formatted).toContain('Bitcoin (BTC)');
            expect(formatted).toContain('Price: $50000.00');
            expect(formatted).toContain('24h Change: 5.25%');
            expect(formatted).toContain('24h Volume: $30000.00M');
            expect(formatted).toContain('Market Cap: $1000.00B');
            expect(formatted).toContain('Rank: #1');
        });
    });
    describe('formatMarketAnalysis', () => {
        it('should format market analysis correctly', () => {
            const asset = {
                id: 'bitcoin',
                rank: '1',
                symbol: 'BTC',
                name: 'Bitcoin',
                priceUsd: '50000.00',
                changePercent24Hr: '5.25',
                volumeUsd24Hr: '30000000000',
                marketCapUsd: '1000000000000',
                supply: '19000000',
                maxSupply: '21000000',
                vwap24Hr: '49500.00'
            };
            const markets = [
                {
                    exchangeId: 'binance',
                    baseSymbol: 'BTC',
                    quoteSymbol: 'USD',
                    priceUsd: '50100.00',
                    volumeUsd24Hr: '10000000000',
                    percentExchangeVolume: '33.33'
                },
                {
                    exchangeId: 'coinbase',
                    baseSymbol: 'BTC',
                    quoteSymbol: 'USD',
                    priceUsd: '50000.00',
                    volumeUsd24Hr: '8000000000',
                    percentExchangeVolume: '26.67'
                }
            ];
            const formatted = formatMarketAnalysis(asset, markets);
            expect(formatted).toContain('Market Analysis for Bitcoin (BTC)');
            expect(formatted).toContain('Current Price: $50000.00');
            expect(formatted).toContain('24h Volume: $30000.00M');
            expect(formatted).toContain('VWAP (24h): $49500.00');
            expect(formatted).toContain('binance: $50100.00');
            expect(formatted).toContain('coinbase: $50000.00');
        });
    });
    describe('formatHistoricalAnalysis', () => {
        it('should format historical analysis correctly', () => {
            const asset = {
                id: 'bitcoin',
                rank: '1',
                symbol: 'BTC',
                name: 'Bitcoin',
                priceUsd: '50000.00',
                changePercent24Hr: '5.25',
                volumeUsd24Hr: '30000000000',
                marketCapUsd: '1000000000000',
                supply: '19000000',
                maxSupply: '21000000',
                vwap24Hr: '49500.00'
            };
            const history = [
                {
                    time: 1609459200000,
                    priceUsd: '45000.00',
                    circulatingSupply: '18500000',
                    date: '2021-01-01'
                },
                {
                    time: 1609545600000,
                    priceUsd: '48000.00',
                    circulatingSupply: '18500000',
                    date: '2021-01-02'
                },
                {
                    time: 1609632000000,
                    priceUsd: '50000.00',
                    circulatingSupply: '18500000',
                    date: '2021-01-03'
                }
            ];
            const formatted = formatHistoricalAnalysis(asset, history);
            expect(formatted).toContain('Historical Analysis for Bitcoin (BTC)');
            expect(formatted).toContain('Period High: $50000.00');
            expect(formatted).toContain('Period Low: $45000.00');
            expect(formatted).toContain('Price Change: 11.11%');
            expect(formatted).toContain('Current Price: $50000.00');
            expect(formatted).toContain('Starting Price: $45000.00');
        });
    });
});
