import type {
  AllocationResult,
  Budget,
  BudgetAllocationItem,
  CategoryTotals,
} from '@/types/budget';

export const ALLOCATION_ERROR_MESSAGE = 'Percentage budgets cannot exceed 100%';
export const ALLOCATION_WARNING_MESSAGE = 'Fixed budgets exceed the salary';

const round2 = (value: number): number => {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
};

export function allocateBudgets(
  salary: number,
  budgets: Budget[],
): AllocationResult {
  let fixedTotal = 0;
  let percentageSum = 0;
  for (const budget of budgets) {
    if (budget.type === 'fixed') {
      fixedTotal += budget.value;
    } else {
      percentageSum += budget.value;
    }
  }

  const remainder = salary - fixedTotal;

  const allocations: BudgetAllocationItem[] = [];
  const categoryTotals: CategoryTotals = {};
  let percentageTotal = 0;
  for (const budget of budgets) {
    const amount =
      budget.type === 'fixed'
        ? budget.value
        : round2((remainder * budget.value) / 100);
    if (budget.type === 'percentage') {
      percentageTotal += amount;
    }
    allocations.push({ ...budget, amount });
    categoryTotals[budget.category] =
      (categoryTotals[budget.category] ?? 0) + amount;
  }

  const error = percentageSum > 100 ? ALLOCATION_ERROR_MESSAGE : null;
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
