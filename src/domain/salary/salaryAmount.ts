export type SalaryErrorReason = 'empty' | 'invalid';

export type SalaryParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: SalaryErrorReason };

export const SALARY_REQUIRED_MESSAGE = 'Enter your gross salary.';
export const SALARY_INVALID_MESSAGE = 'Enter an amount of $ 0.00 or more.';

const AMOUNT_PATTERN = /^\$?(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/;

const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function parseSalary(text: string): SalaryParseResult {
  const compact = text.replace(/\s/g, '');
  if (compact === '') {
    return { ok: false, reason: 'empty' };
  }
  if (!AMOUNT_PATTERN.test(compact)) {
    return { ok: false, reason: 'invalid' };
  }
  const value = Number(compact.replace(/[$,]/g, ''));
  if (value > Number.MAX_SAFE_INTEGER) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, value };
}

export function formatSalary(value: number): string {
  return `$ ${formatter.format(value)}`;
}

export function salaryErrorMessage(reason: SalaryErrorReason): string {
  return reason === 'empty' ? SALARY_REQUIRED_MESSAGE : SALARY_INVALID_MESSAGE;
}
