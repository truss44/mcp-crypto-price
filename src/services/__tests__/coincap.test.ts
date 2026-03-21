import { jest } from '@jest/globals';
import { getAssets, getMarkets, getHistoricalData, clearCache, MissingApiKeyError } from '../coincap.js';

// Mock global fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Suppress console.error during tests
console.error = jest.fn();

describe('CoinCap Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    clearCache();
    process.env = { ...originalEnv, COINCAP_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    clearCache();
    process.env = originalEnv;
  });

  describe('API key validation', () => {
    it('should throw MissingApiKeyError when no API key is set', async () => {
      delete process.env.COINCAP_API_KEY;

      await expect(getAssets()).rejects.toThrow(MissingApiKeyError);
      await expect(getAssets()).rejects.toThrow('https://pro.coincap.io/dashboard');
    });
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
            priceUsd: '50000.00',
            changePercent24Hr: '2.50',
            volumeUsd24Hr: '30000000000',
            marketCapUsd: '950000000000',
            supply: '19000000',
            maxSupply: '21000000',
            vwap24Hr: '49500.00',
          }
        ]
      };

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response));

      const result = await getAssets();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://rest.coincap.io/v3/assets',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-key' }
        })
      );
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
      } as Response));

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
            quoteSymbol: 'USDT',
            priceUsd: '50000.00',
            volumeUsd24Hr: '5000000000',
            percentExchangeVolume: '25.00',
          }
        ]
      };

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response));

      const result = await getMarkets('bitcoin');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://rest.coincap.io/v3/assets/bitcoin/markets',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-key' }
        })
      );
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
      } as Response));

      const result = await getHistoricalData('bitcoin', 'h1', 1609459200000, 1609545600000);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://rest.coincap.io/v3/assets/bitcoin/history'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-key' }
        })
      );
    });

    it('should handle fetch errors for historical data', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      const result = await getHistoricalData('bitcoin', 'h1', 1609459200000, 1609545600000);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
