import { z } from 'zod';
import { getRates, getRate } from '../services/coincap.js';
import { formatRates, formatRate } from '../services/formatters.js';

export const GetRatesSchema = z.object({
  slug: z
    .string()
    .optional()
    .describe(
      "Optional: rate slug to fetch a single rate (e.g. 'us-dollar', 'euro', 'bitcoin')"
    ),
});

export async function handleGetRates(args: unknown) {
  const { slug } = GetRatesSchema.parse(args);

  try {
    if (slug) {
      const rate = await getRate(slug);

      if (!rate) {
        return {
          content: [
            {
              type: 'text',
              text: `Could not find rate for slug "${slug}". Try a slug like 'us-dollar', 'euro', or 'bitcoin'.`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: formatRate(rate) }],
      };
    }

    const rates = await getRates();

    if (!rates) {
      return {
        content: [{ type: 'text', text: 'Failed to retrieve currency rates' }],
      };
    }

    return {
      content: [{ type: 'text', text: formatRates(rates) }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text:
            error instanceof Error
              ? error.message
              : `Failed to retrieve rates: ${String(error)}`,
        },
      ],
    };
  }
}
