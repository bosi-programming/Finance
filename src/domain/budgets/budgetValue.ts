import { formatSalary, parseSalary } from '@/domain/salary/salaryAmount';
import { type Budget, type BudgetType } from '@/types/budget';

export type BudgetValueResult = { ok: true; value: number } | { ok: false };

const PERCENTAGE_PATTERN = /^\d+(\.\d{1,2})?%?$/;
const MAX_PERCENTAGE = 100;

export function parseFixedValue(text: string): BudgetValueResult {
  const parsed = parseSalary(text);
  if (parsed.ok && parsed.value > 0) {
    return { ok: true, value: parsed.value };
  }
  return { ok: false };
}

export function parsePercentageValue(text: string): BudgetValueResult {
  const compact = text.replace(/\s/g, '');
  if (!PERCENTAGE_PATTERN.test(compact)) {
    return { ok: false };
  }
  const value = Number(compact.replace('%', ''));
  if (value > 0 && value <= MAX_PERCENTAGE) {
    return { ok: true, value };
  }
  return { ok: false };
}

export function parseBudgetValue(
  type: BudgetType,
  text: string,
): BudgetValueResult {
  return type === 'percentage'
    ? parsePercentageValue(text)
    : parseFixedValue(text);
}

export function formatValueInput(budget: Budget): string {
  return budget.type === 'percentage'
    ? `${String(budget.value)}%`
    : formatSalary(budget.value);
}

export function valuePlaceholder(type: BudgetType | ''): string {
  return type === 'percentage' ? '0%' : '$ 0.00';
}
