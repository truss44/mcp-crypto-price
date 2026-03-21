import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/coincap.js', () => ({
  searchAsset: jest.fn(),
  getAssets: jest.fn(),
  getMarkets: jest.fn(),
  getHistoricalData: jest.fn(),
  clearCache: jest.fn(),
}));

const { searchAsset } = await import('../../services/coincap.js');
const { handleGetPrice } = await import('../price.js');

const mockSearchAsset = searchAsset as jest.MockedFunction<typeof searchAsset>;

describe('handleGetPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted price for a valid symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce({
      id: 'bitcoin', rank: '1', symbol: 'BTC', name: 'Bitcoin',
      priceUsd: '50000.00', changePercent24Hr: '2.50',
      volumeUsd24Hr: '30000000000', marketCapUsd: '950000000000',
      supply: '19000000', maxSupply: '21000000', vwap24Hr: '49500.00',
    });

    const result = await handleGetPrice({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Bitcoin (BTC)');
    expect(result.content[0].text).toContain('50000.00');
  });

  it('should return not-found message for unknown symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(null);

    const result = await handleGetPrice({ symbol: 'ZZZZZ' });
    expect(result.content[0].text).toContain('Could not find cryptocurrency with symbol ZZZZZ');
  });

  it('should return error message on exception', async () => {
    mockSearchAsset.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetPrice({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should throw on missing symbol', async () => {
    await expect(handleGetPrice({})).rejects.toThrow();
  });
});
