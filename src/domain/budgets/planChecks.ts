import { formatMoney, formatPercent } from '@/domain/budgets/budgetFormat';

export function percentageOverMessage(total: number): string {
  return `Percentages sum to ${formatPercent(total)} — must be 100% or less.`;
}

export function fixedOverSalaryMessage(excess: number): string {
  return `Fixed budgets exceed your salary by ${formatMoney(excess)}.`;
}
