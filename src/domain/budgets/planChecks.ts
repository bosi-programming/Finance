import { formatMoney, formatPercent } from '@/domain/budgets/budgetFormat';
import { MAX_PERCENTAGE } from '@/domain/budgets/budgetValue';
import { roundToCents } from '@/domain/money';
import { type Budget } from '@/types/budget';

const PERCENT_NOISE_DIGITS = 8;

export function percentageOverMessage(total: number): string {
  return `Percentages sum to ${formatPercent(total, PERCENT_NOISE_DIGITS)} — must be 100% or less.`;
}

export function fixedOverSalaryMessage(excess: number): string {
  return `Fixed budgets exceed the salary by ${formatMoney(excess)}.`;
}

export function isFixedOverSalary(fixedTotal: number, salary: number): boolean {
  return roundToCents(fixedTotal) > roundToCents(salary);
}

export function percentageTotal(budgets: Budget[]): number {
  const total = budgets
    .filter((budget) => budget.type === 'percentage')
    .reduce((sum, budget) => sum + budget.value, 0);
  return Number(total.toFixed(PERCENT_NOISE_DIGITS));
}

export function isPercentageFull(budgets: Budget[]): boolean {
  return percentageTotal(budgets) === MAX_PERCENTAGE;
}

export function isPercentageOver(budgets: Budget[]): boolean {
  return percentageTotal(budgets) > MAX_PERCENTAGE;
}
