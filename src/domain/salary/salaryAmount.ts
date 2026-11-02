import { formatMoneyFixed, parseMoney } from '@/domain/money';
import { LOCALE_SETTINGS, type LocaleSettings } from '@/i18n/languages';

export type SalaryErrorReason = 'empty' | 'invalid';

export type SalaryParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: SalaryErrorReason };

export type SalaryErrorKey =
  | 'validation.salaryRequired'
  | 'validation.salaryInvalid';

const DEFAULT_SETTINGS = LOCALE_SETTINGS.en;

export function parseSalary(
  text: string,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): SalaryParseResult {
  return parseMoney(text, settings);
}

export function formatSalary(
  value: number,
  settings: LocaleSettings = DEFAULT_SETTINGS,
): string {
  return formatMoneyFixed(value, settings);
}

export function salaryErrorKey(reason: SalaryErrorReason): SalaryErrorKey {
  return reason === 'empty'
    ? 'validation.salaryRequired'
    : 'validation.salaryInvalid';
}
