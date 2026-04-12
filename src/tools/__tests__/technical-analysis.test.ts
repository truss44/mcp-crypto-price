import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/coincap.js', () => ({
  searchAsset: jest.fn(),
  getAssets: jest.fn(),
  getMarkets: jest.fn(),
  getHistoricalData: jest.fn(),
  getTechnicalAnalysis: jest.fn(),
  clearCache: jest.fn(),
}));

const { searchAsset, getTechnicalAnalysis } = await import('../../services/coincap.js');
const { handleGetTechnicalAnalysis } = await import('../technical-analysis.js');

const mockSearchAsset = searchAsset as jest.MockedFunction<typeof searchAsset>;
const mockGetTechnicalAnalysis = getTechnicalAnalysis as jest.MockedFunction<typeof getTechnicalAnalysis>;

const mockAsset = {
  id: 'bitcoin',
  rank: '1',
  symbol: 'BTC',
  name: 'Bitcoin',
  priceUsd: '104232.50',
  changePercent24Hr: '2.50',
  volumeUsd24Hr: '30000000000',
  marketCapUsd: '2050000000000',
  supply: '19000000',
  maxSupply: '21000000',
  vwap24Hr: '103890.00',
};

const mockTa = {
  sma: { period: 20, value: '102100.00' },
  ema: { period: 20, value: '103450.00' },
  rsi: { period: 14, value: '58.30' },
  macd: { value: '1234.50', signal: '980.20', histogram: '254.30' },
  vwap: { value: '103890.00' },
};

describe('handleGetTechnicalAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted technical analysis for a valid symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetTechnicalAnalysis.mockResolvedValueOnce(mockTa);

    const result = await handleGetTechnicalAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Technical Analysis: Bitcoin (BTC)');
    expect(result.content[0].text).toContain('SMA');
    expect(result.content[0].text).toContain('EMA');
    expect(result.content[0].text).toContain('RSI');
    expect(result.content[0].text).toContain('MACD');
    expect(result.content[0].text).toContain('VWAP');
  });

  it('should return not-found message for unknown symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(null);

    const result = await handleGetTechnicalAnalysis({ symbol: 'ZZZZZ' });
    expect(result.content[0].text).toContain('Could not find cryptocurrency with symbol ZZZZZ');
  });

  it('should return error message when technical analysis data is null', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetTechnicalAnalysis.mockResolvedValueOnce(null);

    const result = await handleGetTechnicalAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Failed to retrieve technical analysis');
  });

  it('should handle partial indicator data gracefully', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetTechnicalAnalysis.mockResolvedValueOnce({
      sma: null,
      ema: null,
      rsi: { period: 14, value: '58.30' },
      macd: null,
      vwap: null,
    });

    const result = await handleGetTechnicalAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('RSI');
    expect(result.content[0].text).toContain('N/A');
  });

  it('should return error message on exception', async () => {
    mockSearchAsset.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetTechnicalAnalysis({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should throw on missing symbol', async () => {
    await expect(handleGetTechnicalAnalysis({})).rejects.toThrow();
  });
});
