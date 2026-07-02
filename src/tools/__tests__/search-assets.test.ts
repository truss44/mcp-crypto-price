import { vi, type MockedFunction } from 'vitest';

vi.mock('../../services/coincap.js', () => ({
  searchAsset: vi.fn(),
  searchAssets: vi.fn(),
  getAssets: vi.fn(),
  getMarkets: vi.fn(),
  getHistoricalData: vi.fn(),
  clearCache: vi.fn(),
}));

const { searchAssets } = await import('../../services/coincap.js');
const { handleSearchAssets } = await import('../search-assets.js');

const mockSearchAssets = searchAssets as MockedFunction<typeof searchAssets>;

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
    id: 'bitcoin-cash',
    rank: '20',
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    priceUsd: '300.00',
    changePercent24Hr: '1.10',
    volumeUsd24Hr: '500000000',
    marketCapUsd: '6000000000',
    supply: '20000000',
    maxSupply: '21000000',
    vwap24Hr: '295.00',
  },
];

describe('handleSearchAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return formatted search results for matching assets', async () => {
    mockSearchAssets.mockResolvedValueOnce(mockAssets);

    const result = await handleSearchAssets({ query: 'bit' });
    expect(result.content[0].text).toContain('Search Results');
    expect(result.content[0].text).toContain('Bitcoin (BTC)');
    expect(result.content[0].text).toContain('Bitcoin Cash (BCH)');
    expect(result.content[0].text).toContain('ID: bitcoin');
  });

  it('should return no-results message when no matches found', async () => {
    mockSearchAssets.mockResolvedValueOnce([]);

    const result = await handleSearchAssets({ query: 'xyzabc' });
    expect(result.content[0].text).toContain(
      'No cryptocurrencies found matching "xyzabc"'
    );
  });

  it('should return error message on failure', async () => {
    mockSearchAssets.mockResolvedValueOnce(null);

    const result = await handleSearchAssets({ query: 'bit' });
    expect(result.content[0].text).toBe('Failed to search for assets');
  });

  it('should return error message on exception', async () => {
    mockSearchAssets.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleSearchAssets({ query: 'bit' });
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should return isError for missing query', async () => {
    const result = await handleSearchAssets({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid input');
  });
});
