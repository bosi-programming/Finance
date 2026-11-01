import { type Budget } from '@/types/budget';
import { formatMoney } from '@/domain/money';

export interface BudgetGroup {
  category: string;
  budgets: Budget[];
  fixedTotal: number;
  percentageTotal: number;
}

const TOTAL_SEPARATOR = ' · ';

export { formatMoney };

export function formatPercent(value: number): string {
  const amount = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
  return `${amount}%`;
}

export function budgetDetails(budget: Budget): string {
  if (budget.type === 'fixed') {
    return `Fixed · ${formatMoney(budget.value)} / month`;
  }
  return `Percentage · ${formatPercent(budget.value)}`;
}

export function groupBudgets(budgets: Budget[]): BudgetGroup[] {
  const groups = new Map<string, BudgetGroup>();
  for (const budget of budgets) {
    const group = groups.get(budget.category) ?? {
      category: budget.category,
      budgets: [],
      fixedTotal: 0,
      percentageTotal: 0,
    };
    group.budgets.push(budget);
    if (budget.type === 'fixed') {
      group.fixedTotal += budget.value;
    } else {
      group.percentageTotal += budget.value;
    }
    groups.set(budget.category, group);
  }
  return [...groups.values()];
}

export function formatGroupTotal(group: BudgetGroup): string {
  const parts: string[] = [];
  if (group.budgets.some((budget) => budget.type === 'fixed')) {
    parts.push(formatMoney(group.fixedTotal));
  }
  if (group.budgets.some((budget) => budget.type === 'percentage')) {
    parts.push(formatPercent(group.percentageTotal));
  }
  return parts.join(TOTAL_SEPARATOR);
}
