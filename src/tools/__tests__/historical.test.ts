import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/coincap.js', () => ({
  searchAsset: jest.fn(),
  getAssets: jest.fn(),
  getMarkets: jest.fn(),
  getHistoricalData: jest.fn(),
  clearCache: jest.fn(),
}));

const { searchAsset, getHistoricalData } =
  await import('../../services/coincap.js');
const { handleGetHistoricalAnalysis } = await import('../historical.js');

const mockSearchAsset = searchAsset as jest.MockedFunction<typeof searchAsset>;
const mockGetHistoricalData = getHistoricalData as jest.MockedFunction<
  typeof getHistoricalData
>;

const mockAsset = {
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
};

describe('handleGetHistoricalAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted historical analysis', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetHistoricalData.mockResolvedValueOnce({
      data: [
        { time: 1609459200000, priceUsd: '45000.00', date: '2021-01-01' },
        { time: 1609545600000, priceUsd: '47000.00', date: '2021-01-02' },
      ],
    });

    const result = await handleGetHistoricalAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Historical Analysis for Bitcoin');
    expect(result.content[0].text).toContain('Period High');
  });

  it('should return not-found message for unknown symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(null);

    const result = await handleGetHistoricalAnalysis({ symbol: 'ZZZZZ' });
    expect(result.content[0].text).toContain(
      'Could not find cryptocurrency with symbol ZZZZZ'
    );
  });

  it('should return error when historical data is null', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetHistoricalData.mockResolvedValueOnce(null);

    const result = await handleGetHistoricalAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toBe('Failed to retrieve historical data');
  });

  it('should return message for empty history array', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetHistoricalData.mockResolvedValueOnce({ data: [] });

    const result = await handleGetHistoricalAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toBe(
      'No historical data available for the selected time period'
    );
  });

  it('should clamp days to schema bounds', async () => {
    // days > 30 should fail schema validation
    await expect(
      handleGetHistoricalAnalysis({ symbol: 'BTC', days: 100 })
    ).rejects.toThrow();
    // days < 1 should fail schema validation
    await expect(
      handleGetHistoricalAnalysis({ symbol: 'BTC', days: 0 })
    ).rejects.toThrow();
  });

  it('should throw on missing symbol', async () => {
    await expect(handleGetHistoricalAnalysis({})).rejects.toThrow();
  });
});
