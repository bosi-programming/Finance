import { describe, expect, it } from 'vitest';

import { LOCALE_SETTINGS } from '@/i18n/languages';

import { formatSalary, parseSalary, salaryErrorKey } from './salaryAmount';

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

  it.each([
    '-1',
    'abc',
    '1.234',
    '1e5',
    '1,2,3.4.5',
    '50,00',
    '.5',
    '5.',
    '9'.repeat(400),
    '12345678901234567890',
  ])('returns invalid for bad text: %s', (text) => {
    expect(parseSalary(text)).toEqual({ ok: false, reason: 'invalid' });
  });
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

describe('salaryErrorKey', () => {
  it('maps each reason to its translation key', () => {
    expect(salaryErrorKey('empty')).toBe('validation.salaryRequired');
    expect(salaryErrorKey('invalid')).toBe('validation.salaryInvalid');
  });
});

describe('in pt-BR and es', () => {
  it('parses and formats in the locale', () => {
    expect(parseSalary('R$ 5.000,50', LOCALE_SETTINGS['pt-BR'])).toEqual({
      ok: true,
      value: 5000.5,
    });
    expect(formatSalary(5000.5, LOCALE_SETTINGS.es)).toBe('5000,50 €');
  });
});
