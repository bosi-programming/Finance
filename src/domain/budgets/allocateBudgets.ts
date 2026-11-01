import {
  isFixedOverSalary,
  isPercentageFull,
  isPercentageOver,
} from '@/domain/budgets/planChecks';
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

function giveResidualToLargest(
  allocations: BudgetAllocationItem[],
  remainder: number,
): BudgetAllocationItem[] {
  const percentages = allocations.filter(
    (allocation) => allocation.type === 'percentage',
  );
  const largest = percentages.reduce((top, allocation) =>
    allocation.value > top.value ? allocation : top,
  );
  const allocated = percentages.reduce(
    (sum, allocation) => sum + allocation.amount,
    0,
  );
  const residual = remainder - allocated;
  return allocations.map((allocation) =>
    allocation === largest
      ? { ...allocation, amount: roundToCents(allocation.amount + residual) }
      : allocation,
  );
}

export function allocateBudgets(
  salary: number,
  budgets: Budget[],
): AllocationResult {
  const fixedTotal = getFixedBudgetsTotal(budgets);
  const remainder = salary - fixedTotal;
  const isFull = isPercentageFull(budgets);

  const rounded = budgets.map((budget) => ({
    ...budget,
    amount:
      budget.type === 'fixed'
        ? budget.value
        : roundToCents((remainder * budget.value) / 100),
  }));
  const allocations = isFull
    ? giveResidualToLargest(rounded, remainder)
    : rounded;

  const categoryTotals: CategoryTotals = {};
  let percentageTotal = 0;
  for (const { type, amount, category } of allocations) {
    if (type === 'percentage') {
      percentageTotal += amount;
    }
    categoryTotals[category] = (categoryTotals[category] ?? 0) + amount;
  }

  const error = isPercentageOver(budgets) ? ALLOCATION_ERROR_MESSAGE : null;
  const warning = isFixedOverSalary(fixedTotal, salary)
    ? ALLOCATION_WARNING_MESSAGE
    : null;

  return {
    salary,
    fixedTotal,
    percentageTotal,
    remainder,
    remaining: isFull ? 0 : remainder - percentageTotal,
    allocations,
    categoryTotals,
    error,
    warning,
  };
}
