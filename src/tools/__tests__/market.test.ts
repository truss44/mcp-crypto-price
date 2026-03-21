import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/coincap.js', () => ({
  searchAsset: jest.fn(),
  getAssets: jest.fn(),
  getMarkets: jest.fn(),
  getHistoricalData: jest.fn(),
  clearCache: jest.fn(),
}));

const { searchAsset, getMarkets } = await import('../../services/coincap.js');
const { handleGetMarketAnalysis } = await import('../market.js');

const mockSearchAsset = searchAsset as jest.MockedFunction<typeof searchAsset>;
const mockGetMarkets = getMarkets as jest.MockedFunction<typeof getMarkets>;

const mockAsset = {
  id: 'bitcoin', rank: '1', symbol: 'BTC', name: 'Bitcoin',
  priceUsd: '50000.00', changePercent24Hr: '2.50',
  volumeUsd24Hr: '30000000000', marketCapUsd: '950000000000',
  supply: '19000000', maxSupply: '21000000', vwap24Hr: '49500.00',
};

describe('handleGetMarketAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted market analysis for a valid symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetMarkets.mockResolvedValueOnce({
      data: [{
        exchangeId: 'binance', baseSymbol: 'BTC', quoteSymbol: 'USDT',
        priceUsd: '50000.00', volumeUsd24Hr: '5000000000',
        volumePercent: '25.00',
      }],
    });

    const result = await handleGetMarketAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Market Analysis for Bitcoin');
    expect(result.content[0].text).toContain('binance');
  });

  it('should return not-found message for unknown symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(null);

    const result = await handleGetMarketAnalysis({ symbol: 'ZZZZZ' });
    expect(result.content[0].text).toContain('Could not find cryptocurrency with symbol ZZZZZ');
  });

  it('should return error when markets data is null', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetMarkets.mockResolvedValueOnce(null);

    const result = await handleGetMarketAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toBe('Failed to retrieve market data');
  });

  it('should throw on missing symbol', async () => {
    await expect(handleGetMarketAnalysis({})).rejects.toThrow();
  });
});
