import { z } from 'zod';
import { SYMBOLS, SETUPS, EMOTIONS } from '@/types/trade';

const requiredString = (label: string) =>
  z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`);

export const tradeInputSchema = z
  .object({
    date: requiredString('Date').refine((v) => !Number.isNaN(Date.parse(v)), {
      message: 'Date must be a valid date',
    }),
    symbol: z.enum(SYMBOLS, { required_error: 'Symbol is required' }),
    customSymbol: z.string().trim().max(60).optional(),
    result: z.coerce
      .number({ invalid_type_error: 'Result must be a number' })
      .refine((v) => Number.isFinite(v), 'Result must be a number')
      .refine((v) => v !== 0, 'Result cannot be exactly 0 — record a small win or loss instead'),
    setup: z.enum(SETUPS, { required_error: 'Setup is required' }),
    customSetup: z.string().trim().max(60).optional(),
    emotion: z.enum(EMOTIONS, { required_error: 'Emotion is required' }),
    notes: z.string().trim().max(5000).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.symbol === 'Other' && !data.customSymbol) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customSymbol'],
        message: 'Enter a symbol name',
      });
    }
    if (data.setup === 'Other' && !data.customSetup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customSetup'],
        message: 'Enter a setup name',
      });
    }
  });

export type TradeInput = z.infer<typeof tradeInputSchema>;

// PUT allows partial updates but each provided field still needs to be valid.
export const tradeUpdateSchema = tradeInputSchema;

export const tradeFiltersSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  symbol: z.string().optional(),
  setup: z.string().optional(),
  emotion: z.string().optional(),
  outcome: z.enum(['win', 'loss', 'all']).optional().default('all'),
  sortBy: z.enum(['date', 'result', 'symbol', 'setup']).optional().default('date'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type TradeFiltersInput = z.infer<typeof tradeFiltersSchema>;
