import { isPercentageOver } from '@/domain/budgets/planChecks';
import { getFixedBudgetsTotal } from '@/domain/budgets/totals';
import { roundToCents } from '@/domain/money';
import type {
  AllocationResult,
  Budget,
  BudgetAllocationItem,
  CategoryTotals,
} from '@/types/budget';

export const ALLOCATION_ERROR_MESSAGE = 'Percentage budgets cannot exceed 100%';
export const ALLOCATION_WARNING_MESSAGE = 'Fixed budgets exceed the salary';

export function allocateBudgets(
  salary: number,
  budgets: Budget[],
): AllocationResult {
  const fixedTotal = getFixedBudgetsTotal(budgets);
  const remainder = salary - fixedTotal;

  const allocations: BudgetAllocationItem[] = [];
  const categoryTotals: CategoryTotals = {};
  let percentageTotal = 0;
  for (const budget of budgets) {
    const amount =
      budget.type === 'fixed'
        ? budget.value
        : roundToCents((remainder * budget.value) / 100);
    if (budget.type === 'percentage') {
      percentageTotal += amount;
    }
    allocations.push({ ...budget, amount });
    categoryTotals[budget.category] =
      (categoryTotals[budget.category] ?? 0) + amount;
  }

  const error = isPercentageOver(budgets) ? ALLOCATION_ERROR_MESSAGE : null;
  const warning = fixedTotal > salary ? ALLOCATION_WARNING_MESSAGE : null;

  return {
    salary,
    fixedTotal,
    percentageTotal,
    remainder,
    remaining: remainder - percentageTotal,
    allocations,
    categoryTotals,
    error,
    warning,
  };
}
