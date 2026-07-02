import { vi, type MockedFunction } from 'vitest';

vi.mock('../../services/coincap.js', () => ({
  searchAsset: vi.fn(),
  searchAssets: vi.fn(),
  getAssets: vi.fn(),
  getMarkets: vi.fn(),
  getHistoricalData: vi.fn(),
  clearCache: vi.fn(),
}));

const { getAssets } = await import('../../services/coincap.js');
const { handleGetGlobalMetrics } = await import('../global-metrics.js');

const mockGetAssets = getAssets as MockedFunction<typeof getAssets>;

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

describe('handleGetGlobalMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return formatted global metrics', async () => {
    mockGetAssets.mockResolvedValueOnce({ data: mockAssets });

    const result = await handleGetGlobalMetrics({});
    expect(result.content[0].text).toContain('Global Crypto Market Overview');
    expect(result.content[0].text).toContain('Total Market Cap: $1.30T');
    expect(result.content[0].text).toContain('BTC Dominance: 73.08%');
    expect(result.content[0].text).toContain('Active Cryptocurrencies: 2');
  });

  it('should return error when assets data is null', async () => {
    mockGetAssets.mockResolvedValueOnce(null);

    const result = await handleGetGlobalMetrics({});
    expect(result.content[0].text).toBe(
      'Failed to retrieve global market data'
    );
  });

  it('should return error when assets data is empty', async () => {
    mockGetAssets.mockResolvedValueOnce({ data: [] });

    const result = await handleGetGlobalMetrics({});
    expect(result.content[0].text).toBe('No market data available');
  });

  it('should return error message on exception', async () => {
    mockGetAssets.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetGlobalMetrics({});
    expect(result.content[0].text).toContain('Network failure');
  });
});
