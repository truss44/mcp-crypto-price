import { z } from 'zod';
import { getExchanges, getExchange } from '../services/coincap.js';
import { formatExchanges, formatExchange } from '../services/formatters.js';

export const GetExchangesSchema = z.object({
  exchangeId: z
    .string()
    .optional()
    .describe(
      "Optional: specific exchange ID to look up (e.g. 'binance', 'coinbase', 'kraken')"
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .describe(
      'Number of top exchanges to return when listing (1-50, default 10)'
    ),
});

export async function handleGetExchanges(args: unknown) {
  const { exchangeId, limit = 10 } = GetExchangesSchema.parse(args);

  try {
    if (exchangeId) {
      const exchange = await getExchange(exchangeId);

      if (!exchange) {
        return {
          content: [
            {
              type: 'text',
              text: `Could not find exchange "${exchangeId}". Try an ID like 'binance', 'coinbase', or 'kraken'.`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: formatExchange(exchange) }],
      };
    }

    const exchanges = await getExchanges(limit);

    if (!exchanges) {
      return {
        content: [{ type: 'text', text: 'Failed to retrieve exchanges' }],
      };
    }

    return {
      content: [
        { type: 'text', text: formatExchanges(exchanges.slice(0, limit)) },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text:
            error instanceof Error
              ? error.message
              : `Failed to retrieve exchanges: ${String(error)}`,
        },
      ],
    };
  }
}
