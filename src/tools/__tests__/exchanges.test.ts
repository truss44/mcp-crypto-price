import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/coincap.js', () => ({
  searchAsset: jest.fn(),
  getAssets: jest.fn(),
  getMarkets: jest.fn(),
  getHistoricalData: jest.fn(),
  getExchanges: jest.fn(),
  getExchange: jest.fn(),
  clearCache: jest.fn(),
}));

const { getExchanges, getExchange } = await import('../../services/coincap.js');
const { handleGetExchanges } = await import('../exchanges.js');

const mockGetExchanges = getExchanges as jest.MockedFunction<typeof getExchanges>;
const mockGetExchange = getExchange as jest.MockedFunction<typeof getExchange>;

const mockExchanges = [
  {
    exchangeId: 'binance',
    name: 'Binance',
    rank: '1',
    percentTotalVolume: '35.20',
    volumeUsd: '42300000000',
    tradingPairs: '1234',
    socket: true,
    updated: 1700000000000,
  },
  {
    exchangeId: 'coinbase',
    name: 'Coinbase',
    rank: '2',
    percentTotalVolume: '19.10',
    volumeUsd: '8100000000',
    tradingPairs: '456',
    socket: false,
    updated: 1700000000000,
  },
];

const mockExchange = {
  exchangeId: 'binance',
  name: 'Binance',
  rank: '1',
  percentTotalVolume: '35.20',
  volumeUsd: '42300000000',
  tradingPairs: '1234',
  socket: true,
  updated: 1700000000000,
};

describe('handleGetExchanges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted exchange list when no exchangeId is provided', async () => {
    mockGetExchanges.mockResolvedValueOnce(mockExchanges);

    const result = await handleGetExchanges({});
    expect(result.content[0].text).toContain('Top Cryptocurrency Exchanges');
    expect(result.content[0].text).toContain('Binance');
    expect(result.content[0].text).toContain('Coinbase');
  });

  it('should return a single exchange when exchangeId is provided', async () => {
    mockGetExchange.mockResolvedValueOnce(mockExchange);

    const result = await handleGetExchanges({ exchangeId: 'binance' });
    expect(result.content[0].text).toContain('Exchange: Binance');
    expect(result.content[0].text).toContain('Rank: #1');
    expect(result.content[0].text).toContain('42.30B');
  });

  it('should respect the limit parameter', async () => {
    mockGetExchanges.mockResolvedValueOnce(mockExchanges);

    const result = await handleGetExchanges({ limit: 1 });
    expect(result.content[0].text).toContain('Binance');
    expect(result.content[0].text).not.toContain('Coinbase');
  });

  it('should return error message when exchanges data is null', async () => {
    mockGetExchanges.mockResolvedValueOnce(null);

    const result = await handleGetExchanges({});
    expect(result.content[0].text).toContain('Failed to retrieve');
  });

  it('should return not-found message when single exchange is null', async () => {
    mockGetExchange.mockResolvedValueOnce(null);

    const result = await handleGetExchanges({ exchangeId: 'unknown-exchange' });
    expect(result.content[0].text).toContain('Could not find exchange');
  });

  it('should return error message on exception', async () => {
    mockGetExchanges.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetExchanges({});
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should throw on invalid limit schema (below min)', async () => {
    await expect(handleGetExchanges({ limit: 0 })).rejects.toThrow();
  });

  it('should throw on invalid limit schema (above max)', async () => {
    await expect(handleGetExchanges({ limit: 51 })).rejects.toThrow();
  });
});
