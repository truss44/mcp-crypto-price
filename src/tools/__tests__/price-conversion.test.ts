import { vi, type MockedFunction } from 'vitest';

vi.mock('../../services/coincap.js', () => ({
  searchAsset: vi.fn(),
  searchAssets: vi.fn(),
  getAssets: vi.fn(),
  getMarkets: vi.fn(),
  getHistoricalData: vi.fn(),
  getRates: vi.fn(),
  clearCache: vi.fn(),
}));

const { searchAsset, getRates } = await import('../../services/coincap.js');
const { handleGetPriceConversion } = await import('../price-conversion.js');

const mockSearchAsset = searchAsset as MockedFunction<typeof searchAsset>;
const mockGetRates = getRates as MockedFunction<typeof getRates>;

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

const mockRates = [
  {
    id: 'united-states-dollar',
    symbol: 'USD',
    currencySymbol: '$',
    rateUsd: '1',
    type: 'fiat',
  },
  {
    id: 'euro',
    symbol: 'EUR',
    currencySymbol: '€',
    rateUsd: '1.1',
    type: 'fiat',
  },
  {
    id: 'japanese-yen',
    symbol: 'JPY',
    currencySymbol: '¥',
    rateUsd: '0.0067',
    type: 'fiat',
  },
];

describe('handleGetPriceConversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should convert crypto to USD by default', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetRates.mockResolvedValueOnce(mockRates);

    const result = await handleGetPriceConversion({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Price Conversion');
    expect(result.content[0].text).toContain('1 BTC = 50000.00 USD');
  });

  it('should convert crypto to EUR', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetRates.mockResolvedValueOnce(mockRates);

    const result = await handleGetPriceConversion({
      symbol: 'BTC',
      currency: 'eur',
    });
    expect(result.content[0].text).toContain('1 BTC = 55000.00 EUR');
  });

  it('should handle custom amount', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetRates.mockResolvedValueOnce(mockRates);

    const result = await handleGetPriceConversion({
      symbol: 'BTC',
      amount: 2,
    });
    expect(result.content[0].text).toContain('2 BTC = 100000.00 USD');
  });

  it('should return not-found for unknown symbol', async () => {
    mockSearchAsset.mockResolvedValueOnce(null);

    const result = await handleGetPriceConversion({ symbol: 'ZZZZZ' });
    expect(result.content[0].text).toContain('Could not find');
  });

  it('should return error for unknown currency', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetRates.mockResolvedValueOnce(mockRates);

    const result = await handleGetPriceConversion({
      symbol: 'BTC',
      currency: 'xyz',
    });
    expect(result.content[0].text).toContain('Could not find exchange rate');
  });

  it('should return error when rates data is null', async () => {
    mockSearchAsset.mockResolvedValueOnce(mockAsset);
    mockGetRates.mockResolvedValueOnce(null);

    const result = await handleGetPriceConversion({ symbol: 'BTC' });
    expect(result.content[0].text).toBe('Failed to retrieve exchange rates');
  });

  it('should return error on exception', async () => {
    mockSearchAsset.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetPriceConversion({ symbol: 'BTC' });
    expect(result.content[0].text).toContain('Network failure');
  });

  it('should return isError for missing symbol', async () => {
    const result = await handleGetPriceConversion({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid input');
  });
});
