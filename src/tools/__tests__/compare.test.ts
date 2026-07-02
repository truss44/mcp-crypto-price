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
const { handleCompareCrypto } = await import('../compare.js');

const mockSearchAsset = searchAsset as MockedFunction<typeof searchAsset>;

const mockBtc = {
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

const mockEth = {
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
};

describe('handleCompareCrypto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return comparison table for multiple valid symbols', async () => {
    mockSearchAsset
      .mockResolvedValueOnce(mockBtc)
      .mockResolvedValueOnce(mockEth);

    const result = await handleCompareCrypto({ symbols: 'BTC,ETH' });
    expect(result.content[0].text).toContain('Cryptocurrency Comparison');
    expect(result.content[0].text).toContain('Bitcoin (BTC)');
    expect(result.content[0].text).toContain('Ethereum (ETH)');
  });

  it('should return error for fewer than 2 symbols', async () => {
    const result = await handleCompareCrypto({ symbols: 'BTC' });
    expect(result.content[0].text).toContain('2-5 cryptocurrency symbols');
  });

  it('should return error for more than 5 symbols', async () => {
    const result = await handleCompareCrypto({
      symbols: 'BTC,ETH,SOL,DOGE,XRP,ADA',
    });
    expect(result.content[0].text).toContain('2-5 cryptocurrency symbols');
  });

  it('should include not-found note for missing assets', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockBtc).mockResolvedValueOnce(null);

    const result = await handleCompareCrypto({ symbols: 'BTC,ZZZZZ' });
    expect(result.content[0].text).toContain('Bitcoin (BTC)');
    expect(result.content[0].text).toContain('Not found: ZZZZZ');
  });

  it('should return error when all assets not found', async () => {
    mockSearchAsset.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const result = await handleCompareCrypto({ symbols: 'AAA,BBB' });
    expect(result.content[0].text).toContain('Could not find');
  });

  it('should return error on exception', async () => {
    mockSearchAsset.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleCompareCrypto({ symbols: 'BTC,ETH' });
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should return isError for missing symbols', async () => {
    const result = await handleCompareCrypto({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid input');
  });
});
