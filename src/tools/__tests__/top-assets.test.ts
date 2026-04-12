import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/coincap.js', () => ({
  searchAsset: jest.fn(),
  getAssets: jest.fn(),
  getMarkets: jest.fn(),
  getHistoricalData: jest.fn(),
  clearCache: jest.fn(),
}));

const { getAssets } = await import('../../services/coincap.js');
const { handleGetTopAssets } = await import('../top-assets.js');

const mockGetAssets = getAssets as jest.MockedFunction<typeof getAssets>;

const mockAssets = [
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
  },
  {
    id: 'ethereum',
    rank: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    priceUsd: '3000.00',
    changePercent24Hr: '1.20',
    volumeUsd24Hr: '15000000000',
    marketCapUsd: '350000000000',
    supply: '120000000',
    maxSupply: null,
    vwap24Hr: '2950.00',
  },
];

describe('handleGetTopAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted top assets', async () => {
    mockGetAssets.mockResolvedValueOnce({ data: mockAssets });

    const result = await handleGetTopAssets({});
    expect(result.content[0].text).toContain(
      'Top Cryptocurrencies by Market Cap'
    );
    expect(result.content[0].text).toContain('Bitcoin (BTC)');
    expect(result.content[0].text).toContain('Ethereum (ETH)');
  });

  it('should respect limit parameter', async () => {
    mockGetAssets.mockResolvedValueOnce({ data: mockAssets });

    const result = await handleGetTopAssets({ limit: 1 });
    expect(result.content[0].text).toContain('Bitcoin');
    expect(result.content[0].text).not.toContain('Ethereum');
  });

  it('should return error when assets data is null', async () => {
    mockGetAssets.mockResolvedValueOnce(null);

    const result = await handleGetTopAssets({});
    expect(result.content[0].text).toBe('Failed to retrieve assets data');
  });

  it('should reject limit > 50', async () => {
    await expect(handleGetTopAssets({ limit: 100 })).rejects.toThrow();
  });

  it('should reject limit < 1', async () => {
    await expect(handleGetTopAssets({ limit: 0 })).rejects.toThrow();
  });
});
