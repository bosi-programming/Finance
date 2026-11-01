import { describe, expect, it } from 'vitest';

import {
  SALARY_INVALID_MESSAGE,
  SALARY_REQUIRED_MESSAGE,
  formatSalary,
  parseSalary,
  salaryErrorMessage,
} from './salaryAmount';

describe('parseSalary', () => {
  it.each([
    ['0', 0],
    ['$0', 0],
    ['0.00', 0],
    ['5000', 5000],
    ['5,000', 5000],
    ['$ 5,000.00', 5000],
    ['5000.5', 5000.5],
  ])('parses plain and formatted amounts: %s', (text, value) => {
    expect(parseSalary(text)).toEqual({ ok: true, value });
  });

  it.each(['', '   '])('returns empty for blank text: %j', (text) => {
    expect(parseSalary(text)).toEqual({ ok: false, reason: 'empty' });
  });

  it.each(['-1', 'abc', '1.234', '1e5', '1,2,3.4.5', '50,00', '.5', '5.'])(
    'returns invalid for bad text: %s',
    (text) => {
      expect(parseSalary(text)).toEqual({ ok: false, reason: 'invalid' });
    },
  );
});

describe('formatSalary', () => {
  it.each([
    [5000, '$ 5,000.00'],
    [5000.5, '$ 5,000.50'],
    [0, '$ 0.00'],
    [1234567.89, '$ 1,234,567.89'],
  ])('formats with dollar sign, groups and two decimals: %d', (value, text) => {
    expect(formatSalary(value)).toBe(text);
  });
});

describe('salaryErrorMessage', () => {
  it('maps each reason to its message', () => {
    expect(salaryErrorMessage('empty')).toBe(SALARY_REQUIRED_MESSAGE);
    expect(salaryErrorMessage('invalid')).toBe(SALARY_INVALID_MESSAGE);
  });
});
