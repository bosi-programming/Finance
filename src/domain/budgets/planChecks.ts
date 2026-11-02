import { type TFunction } from 'i18next';

import { formatMoney, formatPercent } from '@/domain/budgets/budgetFormat';
import { MAX_PERCENTAGE } from '@/domain/budgets/budgetValue';
import { roundToCents } from '@/domain/money';
import { LOCALE_SETTINGS, type LocaleSettings } from '@/i18n/languages';
import { type Budget } from '@/types/budget';

const PERCENT_NOISE_DIGITS = 8;
const DEFAULT_SETTINGS = LOCALE_SETTINGS.en;

export function percentageOverMessage(
  total: number,
  t: TFunction,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  return t('plan.percentageOver', {
    total: formatPercent(total, PERCENT_NOISE_DIGITS, settings),
    max: formatPercent(MAX_PERCENTAGE, 0, settings),
  });
}

export function fixedOverSalaryMessage(
  excess: number,
  t: TFunction,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  return t('plan.fixedOverSalary', {
    excess: formatMoney(excess, settings),
  });
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
