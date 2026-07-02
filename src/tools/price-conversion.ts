import { z, ZodError } from 'zod';
import { searchAsset, getRates } from '../services/coincap.js';
import { formatPriceConversion } from '../services/formatters.js';

export const GetPriceConversionSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .describe('Cryptocurrency symbol to convert from (e.g. BTC, ETH)'),
  amount: z
    .number()
    .positive()
    .default(1)
    .describe('Amount of the cryptocurrency to convert (default 1)'),
  currency: z
    .string()
    .min(1)
    .default('usd')
    .describe('Target currency code (e.g. "usd", "eur", "gbp", "jpy")'),
});

export const PriceConversionOutputSchema = z.object({
  fromSymbol: z.string(),
  amount: z.number(),
  toCurrency: z.string(),
  conversionRate: z.number(),
  convertedAmount: z.number(),
});

export async function handleGetPriceConversion(args: unknown) {
  try {
    const { symbol, amount, currency } = GetPriceConversionSchema.parse(args);
    const upperSymbol = symbol.toUpperCase();
    const upperCurrency = currency.toLowerCase();

    const asset = await searchAsset(upperSymbol);

    if (!asset) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not find cryptocurrency with symbol ${upperSymbol}`,
          },
        ],
      };
    }

    const rates = await getRates();

    if (!rates) {
      return {
        content: [{ type: 'text', text: 'Failed to retrieve exchange rates' }],
      };
    }

    const rate = rates.find((r) => r.symbol.toLowerCase() === upperCurrency);

    if (!rate) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not find exchange rate for currency "${currency}". Available currencies include: usd, eur, gbp, jpy, etc.`,
          },
        ],
      };
    }

    const priceUsd = parseFloat(asset.priceUsd);
    const usdToCurrency = parseFloat(rate.rateUsd);
    const conversionRate = priceUsd * usdToCurrency;

    return {
      content: [
        {
          type: 'text',
          text: formatPriceConversion(
            upperSymbol,
            amount,
            upperCurrency,
            conversionRate
          ),
        },
      ],
      structuredContent: {
        fromSymbol: upperSymbol,
        amount,
        toCurrency: upperCurrency,
        conversionRate,
        convertedAmount: amount * conversionRate,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Invalid input: ${error.issues.map((e) => e.message).join(', ')}`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text:
            error instanceof Error
              ? error.message
              : `Failed to convert price: ${String(error)}`,
        },
      ],
    };
  }
}
