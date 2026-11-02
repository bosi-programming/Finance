import { describe, expect, it } from 'vitest';

import { LOCALE_SETTINGS } from '@/i18n/languages';
import type { Budget } from '@/types/budget';

import {
  formatValueInput,
  parseBudgetValue,
  parseFixedValue,
  parsePercentageValue,
  valuePlaceholder,
} from './budgetValue';

const rent: Budget = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
};
const fun: Budget = {
  id: 'fun-1',
  name: 'Fun',
  type: 'percentage',
  value: 60,
  category: 'Leisure',
};

describe('parseFixedValue', () => {
  it.each([
    ['2000', 2000],
    ['$ 2,000.00', 2000],
    ['0.01', 0.01],
  ])('accepts amounts above zero: %s', (text, value) => {
    expect(parseFixedValue(text)).toEqual({ ok: true, value });
  });

  it.each(['0', '-5', 'abc', '1.234', ''])(
    'rejects zero and bad text: %j',
    (text) => {
      expect(parseFixedValue(text)).toEqual({ ok: false });
    },
  );
});

describe('parsePercentageValue', () => {
  it.each([
    ['100', 100],
    ['12.5', 12.5],
    ['30%', 30],
    ['12.25', 12.25],
    [' 5 % ', 5],
  ])('accepts 0 < v <= 100: %j', (text, value) => {
    expect(parsePercentageValue(text)).toEqual({ ok: true, value });
  });

  it.each(['0', '101', '-1', '12.345', 'abc', '', '%'])(
    'rejects the rest: %j',
    (text) => {
      expect(parsePercentageValue(text)).toEqual({ ok: false });
    },
  );
});

describe('parseBudgetValue', () => {
  it('picks the rule by type', () => {
    expect(parseBudgetValue('fixed', '1.234')).toEqual({ ok: false });
    expect(parseBudgetValue('percentage', '50')).toEqual({
      ok: true,
      value: 50,
    });
  });

  it('applies the fixed rule to fixed and the percentage cap to percentage', () => {
    expect(parseBudgetValue('fixed', '150')).toEqual({ ok: true, value: 150 });
    expect(parseBudgetValue('percentage', '150')).toEqual({ ok: false });
  });
});

describe('formatValueInput', () => {
  it('formats a fixed and a percentage budget', () => {
    expect(formatValueInput(rent)).toBe('$ 2,000.00');
    expect(formatValueInput(fun)).toBe('60%');
  });
});

describe('valuePlaceholder', () => {
  it('follows the type', () => {
    expect(valuePlaceholder('')).toBe('$ 0.00');
    expect(valuePlaceholder('fixed')).toBe('$ 0.00');
    expect(valuePlaceholder('percentage')).toBe('0%');
  });
});

describe('in pt-BR and es', () => {
  const ptBR = LOCALE_SETTINGS['pt-BR'];
  const es = LOCALE_SETTINGS.es;

  it.each([
    [ptBR, 'R$ 2.000,00', 2000],
    [es, '89,90 €', 89.9],
  ])('parses fixed values: %j %s', (settings, text, value) => {
    expect(parseFixedValue(text, settings)).toEqual({ ok: true, value });
  });

  it.each([
    [ptBR, '12,5%', 12.5],
    [es, '12,25 %', 12.25],
  ])('parses percentages: %j %s', (settings, text, value) => {
    expect(parsePercentageValue(text, settings)).toEqual({ ok: true, value });
  });

  it('rejects the en decimal in pt-BR', () => {
    expect(parsePercentageValue('12.5', ptBR)).toEqual({ ok: false });
    expect(parseBudgetValue('fixed', '2,000.00', ptBR)).toEqual({ ok: false });
  });

  it('formats inputs and placeholders', () => {
    expect(formatValueInput(rent, ptBR)).toBe('R$ 2.000,00');
    expect(formatValueInput({ ...fun, value: 12.5 }, es)).toBe('12,5%');
    expect(valuePlaceholder('fixed', es)).toBe('0,00 €');
    expect(valuePlaceholder('percentage', ptBR)).toBe('0%');
  });
});
