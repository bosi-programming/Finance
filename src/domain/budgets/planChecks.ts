import { formatMoney, formatPercent } from '@/domain/budgets/budgetFormat';
import { MAX_PERCENTAGE } from '@/domain/budgets/budgetValue';
import { type Budget } from '@/types/budget';

export function percentageOverMessage(total: number): string {
  return `Percentages sum to ${formatPercent(total)} — must be 100% or less.`;
}

export function fixedOverSalaryMessage(excess: number): string {
  return `Fixed budgets exceed your salary by ${formatMoney(excess)}.`;
}

export function percentageTotal(budgets: Budget[]): number {
  const total = budgets
    .filter((budget) => budget.type === 'percentage')
    .reduce((sum, budget) => sum + budget.value, 0);
  return Math.round(total * 100) / 100;
}

export function isPercentageOver(budgets: Budget[]): boolean {
  return percentageTotal(budgets) > MAX_PERCENTAGE;
}
