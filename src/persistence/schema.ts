import { z } from 'zod';
import {
  type AppState,
  type Budget,
  type LegacyCliFile,
  type StoredRow,
} from '@/types/budget';

const nonEmptyString = z.string().min(1);
const amount = z.number().nonnegative();

export const budgetSchema: z.ZodType<Budget> = z.strictObject({
  id: nonEmptyString,
  name: nonEmptyString,
  type: z.enum(['fixed', 'percentage']),
  value: amount,
  category: nonEmptyString,
});

const uniqueBudgets = z
  .array(budgetSchema)
  .refine(
    (budgets) =>
      new Set(budgets.map((budget) => budget.id)).size === budgets.length,
    { message: 'Budget ids must be unique' },
  );

export const appStateSchema: z.ZodType<AppState> = z.strictObject({
  version: z.literal('v0'),
  salary: amount,
  budgets: uniqueBudgets,
});

export const storedRowSchema: z.ZodType<StoredRow> = z.strictObject({
  version: z.literal('v0'),
  salary: amount.nullable(),
  budgets: uniqueBudgets,
});

export const legacyCliSchema: z.ZodType<LegacyCliFile> = z.strictObject({
  salary: amount,
  fixed: z
    .strictObject({
      personal: amount.optional(),
      business: amount.optional(),
      subscriptions: amount.optional(),
      fixedInvestments: amount.optional(),
    })
    .optional(),
  percentage: z
    .strictObject({
      investments: amount.optional(),
      leisure: amount.optional(),
    })
    .optional(),
});
