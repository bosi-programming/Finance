import { formatMoneyFixed, parseMoney } from '@/domain/money';

export type SalaryErrorReason = 'empty' | 'invalid';

export type SalaryParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: SalaryErrorReason };

export const SALARY_REQUIRED_MESSAGE = 'Enter your gross salary.';
export const SALARY_INVALID_MESSAGE = 'Enter an amount of $ 0.00 or more.';

export function parseSalary(text: string): SalaryParseResult {
  return parseMoney(text);
}

export function formatSalary(value: number): string {
  return formatMoneyFixed(value);
}

export function salaryErrorMessage(reason: SalaryErrorReason): string {
  return reason === 'empty' ? SALARY_REQUIRED_MESSAGE : SALARY_INVALID_MESSAGE;
}
