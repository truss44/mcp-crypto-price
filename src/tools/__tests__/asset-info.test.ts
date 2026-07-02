import { vi, type MockedFunction } from 'vitest';

vi.mock('../../services/coincap.js', () => ({
  searchAsset: vi.fn(),
  searchAssets: vi.fn(),
  getAssets: vi.fn(),
  getMarkets: vi.fn(),
  getHistoricalData: vi.fn(),
  clearCache: vi.fn(),
}));

const { searchAsset } = await import('../../services/coincap.js');
const { handleGetAssetInfo } = await import('../asset-info.js');

const mockSearchAsset = searchAsset as MockedFunction<typeof searchAsset>;

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

const mockAssetNoMaxSupply = {
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
  vwap24Hr: null,
};

describe('handleGetAssetInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return full asset info for valid symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);

    const result = await handleGetAssetInfo({ symbol: 'BTC' });
    expect(result.content[0].text).toContain(
      'Asset Information: Bitcoin (BTC)'
    );
    expect(result.content[0].text).toContain('ID: bitcoin');
    expect(result.content[0].text).toContain('Rank: #1');
    expect(result.content[0].text).toContain('Price: $50000.00');
    expect(result.content[0].text).toContain('Max Supply: 21,000,000');
    expect(result.content[0].text).toContain('VWAP (24h): $49500.00');
  });

  it('should handle null maxSupply', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAssetNoMaxSupply);

    const result = await handleGetAssetInfo({ symbol: 'ETH' });
    expect(result.content[0].text).toContain('Max Supply: Unlimited');
    expect(result.content[0].text).toContain('VWAP (24h): N/A');
  });

  it('should return not-found message for unknown symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(null);

    const result = await handleGetAssetInfo({ symbol: 'ZZZZZ' });
    expect(result.content[0].text).toContain('Could not find');
  });

  it('should return error on exception', async () => {
    mockSearchAsset.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetAssetInfo({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should return isError for missing symbol', async () => {
    const result = await handleGetAssetInfo({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid input');
  });
});
