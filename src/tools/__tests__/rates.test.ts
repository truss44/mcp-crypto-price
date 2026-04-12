import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/coincap.js', () => ({
  searchAsset: jest.fn(),
  getAssets: jest.fn(),
  getMarkets: jest.fn(),
  getHistoricalData: jest.fn(),
  getRates: jest.fn(),
  getRate: jest.fn(),
  clearCache: jest.fn(),
}));

const { getRates, getRate } = await import('../../services/coincap.js');
const { handleGetRates } = await import('../rates.js');

const mockGetRates = getRates as jest.MockedFunction<typeof getRates>;
const mockGetRate = getRate as jest.MockedFunction<typeof getRate>;

const mockRates = [
  { id: 'us-dollar', symbol: 'USD', currencySymbol: '$', type: 'fiat', rateUsd: '1.0000' },
  { id: 'euro', symbol: 'EUR', currencySymbol: '€', type: 'fiat', rateUsd: '0.9182' },
  { id: 'british-pound', symbol: 'GBP', currencySymbol: '£', type: 'fiat', rateUsd: '1.2645' },
  { id: 'bitcoin', symbol: 'BTC', currencySymbol: null, type: 'crypto', rateUsd: '104232.50' },
  { id: 'ethereum', symbol: 'ETH', currencySymbol: null, type: 'crypto', rateUsd: '3210.45' },
];

const mockRate = { id: 'euro', symbol: 'EUR', currencySymbol: '€', type: 'fiat', rateUsd: '0.9182' };

describe('handleGetRates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all rates when no slug is provided', async () => {
    mockGetRates.mockResolvedValueOnce(mockRates);

    const result = await handleGetRates({});
    expect(result.content[0].text).toContain('Currency Conversion Rates');
    expect(result.content[0].text).toContain('Fiat');
    expect(result.content[0].text).toContain('EUR');
    expect(result.content[0].text).toContain('BTC');
  });

  it('should return a single rate when slug is provided', async () => {
    mockGetRate.mockResolvedValueOnce(mockRate);

    const result = await handleGetRates({ slug: 'euro' });
    expect(result.content[0].text).toContain('Rate: Euro');
    expect(result.content[0].text).toContain('EUR');
    expect(result.content[0].text).toContain('0.9182');
  });

  it('should return error message when rates data is null', async () => {
    mockGetRates.mockResolvedValueOnce(null);

    const result = await handleGetRates({});
    expect(result.content[0].text).toContain('Failed to retrieve');
  });

  it('should return not-found message when single rate is null', async () => {
    mockGetRate.mockResolvedValueOnce(null);

    const result = await handleGetRates({ slug: 'unknown-currency' });
    expect(result.content[0].text).toContain('Could not find rate for slug');
  });

  it('should handle fiat and crypto rates separately', async () => {
    mockGetRates.mockResolvedValueOnce(mockRates);

    const result = await handleGetRates({});
    const text = result.content[0].text;
    expect(text).toContain('Fiat');
    expect(text).toContain('Crypto');
  });

  it('should return error message on exception', async () => {
    mockGetRates.mockRejectedValueOnce(new Error('Network failure'));

    const result = await handleGetRates({});
    expect(result.content[0].text).toContain('Network failure');
  });
});
