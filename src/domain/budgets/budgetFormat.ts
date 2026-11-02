import { type TFunction } from 'i18next';

import { formatMoney, formatNumber } from '@/domain/money';
import { LOCALE_SETTINGS, type LocaleSettings } from '@/i18n/languages';
import { type Budget } from '@/types/budget';

export interface BudgetGroup {
  category: string;
  budgets: Budget[];
  fixedTotal: number;
  percentageTotal: number;
}

const TOTAL_SEPARATOR = ' · ';
const DEFAULT_SETTINGS = LOCALE_SETTINGS.en;

export { formatMoney };

export function formatPercent(
  value: number,
  maximumFractionDigits = 2,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  return `${formatNumber(value, maximumFractionDigits, settings)}%`;
}

export function budgetDetails(
  budget: Budget,
  t: TFunction,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  if (budget.type === 'fixed') {
    return t('format.detailsFixed', {
      amount: formatMoney(budget.value, settings),
    });
  }
  return t('format.detailsPercentage', {
    percent: formatPercent(budget.value, 2, settings),
  });
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

export function formatGroupTotal(
  group: BudgetGroup,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  const parts: string[] = [];
  if (group.budgets.some((budget) => budget.type === 'fixed')) {
    parts.push(formatMoney(group.fixedTotal, settings));
  }
  if (group.budgets.some((budget) => budget.type === 'percentage')) {
    parts.push(formatPercent(group.percentageTotal, 2, settings));
  }
  return parts.join(TOTAL_SEPARATOR);
}
