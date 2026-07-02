import { vi, type MockedFunction } from 'vitest';

vi.mock('../../services/coincap.js', () => ({
  searchAsset: vi.fn(),
  searchAssets: vi.fn(),
  getAssets: vi.fn(),
  getMarkets: vi.fn(),
  getHistoricalData: vi.fn(),
  getCandles: vi.fn(),
  clearCache: vi.fn(),
}));

const { searchAsset, getCandles } = await import('../../services/coincap.js');
const { handleGetCandlestickData } = await import('../candlestick.js');

const mockSearchAsset = searchAsset as MockedFunction<typeof searchAsset>;
const mockGetCandles = getCandles as MockedFunction<typeof getCandles>;

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

const mockCandles = [
  {
    open: '49000.00',
    high: '50500.00',
    low: '48500.00',
    close: '50000.00',
    volume: '1000000',
    period: 1700000000000,
  },
  {
    open: '50000.00',
    high: '51000.00',
    low: '49500.00',
    close: '50800.00',
    volume: '1200000',
    period: 1700003600000,
  },
];

describe('handleGetCandlestickData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return formatted candlestick data for valid symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetCandles.mockResolvedValueOnce({ data: mockCandles });

    const result = await handleGetCandlestickData({ symbol: 'BTC' });
    expect(result.content[0].text).toContain(
      'Candlestick Data for Bitcoin (BTC)'
    );
    expect(result.content[0].text).toContain('O: $49000.00');
    expect(result.content[0].text).toContain('C: $50800.00');
    expect(result.content[0].text).toContain('Exchange: poloniex');
  });

  it('should return not-found message for unknown symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(null);

    const result = await handleGetCandlestickData({ symbol: 'ZZZZZ' });
    expect(result.content[0].text).toContain('Could not find');
  });

  it('should return error when candlestick data is null', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetCandles.mockResolvedValueOnce(null);

    const result = await handleGetCandlestickData({ symbol: 'BTC' });
    expect(result.content[0].text).toBe('Failed to retrieve candlestick data');
  });

  it('should return no-data message when candles array is empty', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetCandles.mockResolvedValueOnce({ data: [] });

    const result = await handleGetCandlestickData({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('No candlestick data available');
  });

  it('should return error on exception', async () => {
    mockSearchAsset.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetCandlestickData({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should return isError for missing symbol', async () => {
    const result = await handleGetCandlestickData({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid input');
  });
});
