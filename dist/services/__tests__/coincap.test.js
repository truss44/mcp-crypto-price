import { jest } from '@jest/globals';
import { getAssets, getMarkets, getHistoricalData, clearCache } from '../coincap.js';
// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;
// Suppress console.error during tests
console.error = jest.fn();
describe('CoinCap Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
        clearCache();
    });
    afterEach(() => {
        clearCache();
    });
    describe('getAssets', () => {
        it('should fetch assets successfully', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 'bitcoin',
                        rank: '1',
                        symbol: 'BTC',
                        name: 'Bitcoin',
                        priceUsd: '50000.00'
                    }
                ]
            };
            mockFetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await getAssets();
            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith('https://api.coincap.io/v2/assets', expect.any(Object));
        });
        it('should handle fetch errors', async () => {
            mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
            const result = await getAssets();
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
        it('should handle non-ok response', async () => {
            mockFetch.mockImplementationOnce(() => Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            }));
            const result = await getAssets();
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });
    describe('getMarkets', () => {
        it('should fetch markets successfully', async () => {
            const mockResponse = {
                data: [
                    {
                        exchangeId: 'binance',
                        baseSymbol: 'BTC',
                        priceUsd: '50000.00'
                    }
                ]
            };
            mockFetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await getMarkets('bitcoin');
            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith('https://api.coincap.io/v2/assets/bitcoin/markets', expect.any(Object));
        });
        it('should handle fetch errors for markets', async () => {
            mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
            const result = await getMarkets('bitcoin');
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });
    describe('getHistoricalData', () => {
        it('should fetch historical data successfully', async () => {
            const mockResponse = {
                data: [
                    {
                        time: 1609459200000,
                        priceUsd: '45000.00',
                        date: '2021-01-01'
                    }
                ]
            };
            mockFetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await getHistoricalData('bitcoin', 'h1', 1609459200000, 1609545600000);
            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('https://api.coincap.io/v2/assets/bitcoin/history'), expect.any(Object));
        });
        it('should handle fetch errors for historical data', async () => {
            mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
            const result = await getHistoricalData('bitcoin', 'h1', 1609459200000, 1609545600000);
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });
});
