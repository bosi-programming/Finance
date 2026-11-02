import {
  formatMoneyFixed,
  formatNumber,
  parseMoney,
  parseNumber,
} from '@/domain/money';
import { LOCALE_SETTINGS, type LocaleSettings } from '@/i18n/languages';
import { type Budget, type BudgetType } from '@/types/budget';

export type BudgetValueResult = { ok: true; value: number } | { ok: false };

export const MAX_PERCENTAGE = 100;
const PERCENT_INPUT_DIGITS = 2;
const DEFAULT_SETTINGS = LOCALE_SETTINGS.en;

export function parseFixedValue(
  text: string,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): BudgetValueResult {
  const parsed = parseMoney(text, settings);
  if (parsed.ok && parsed.value > 0) {
    return { ok: true, value: parsed.value };
  }
  return { ok: false };
}

export function parsePercentageValue(
  text: string,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): BudgetValueResult {
  const compact = text.replace(/\s/g, '');
  const value = parseNumber(compact.replace(/%$/, ''), settings);
  if (value !== null && value > 0 && value <= MAX_PERCENTAGE) {
    return { ok: true, value };
  }
  return { ok: false };
}

export function parseBudgetValue(
  type: BudgetType,
  text: string,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): BudgetValueResult {
  return type === 'percentage'
    ? parsePercentageValue(text, settings)
    : parseFixedValue(text, settings);
}

export function formatValueInput(
  budget: Budget,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  return budget.type === 'percentage'
    ? `${formatNumber(budget.value, PERCENT_INPUT_DIGITS, settings)}%`
    : formatMoneyFixed(budget.value, settings);
}

export function valuePlaceholder(
  type: BudgetType | '',
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  return type === 'percentage' ? '0%' : formatMoneyFixed(0, settings);
}
