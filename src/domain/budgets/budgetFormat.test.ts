import { describe, expect, it } from 'vitest';

import type { Budget } from '@/types/budget';

import {
  budgetDetails,
  formatGroupTotal,
  formatMoney,
  formatPercent,
  groupBudgets,
} from './budgetFormat';

const rent: Budget = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
};
const power: Budget = {
  id: 'power-1',
  name: 'Power',
  type: 'fixed',
  value: 89.9,
  category: 'Housing',
};
const fun: Budget = {
  id: 'fun-1',
  name: 'Fun',
  type: 'percentage',
  value: 60,
  category: 'Leisure',
};

describe('formatMoney', () => {
  it.each([
    [2000, '$2,000'],
    [0, '$0'],
    [1234567, '$1,234,567'],
  ])('drops .00 on whole amounts: %s', (value, text) => {
    expect(formatMoney(value)).toBe(text);
  });

  it.each([
    [2089.9, '$2,089.90'],
    [89.95, '$89.95'],
  ])('keeps two decimals otherwise: %s', (value, text) => {
    expect(formatMoney(value)).toBe(text);
  });

  it.each([
    [1.115, '$1.12'],
    [-1.115, '-$1.12'],
    [0.005, '$0.01'],
    [-0.005, '-$0.01'],
  ])('rounds the same way for either sign: %s', (value, text) => {
    expect(formatMoney(value)).toBe(text);
  });

  it.each([
    [-500, '-$500'],
    [-1234.5, '-$1,234.50'],
  ])('writes negatives with the sign first: %s', (value, text) => {
    expect(formatMoney(value)).toBe(text);
  });

  it('never writes negative zero', () => {
    expect(formatMoney(-0.001)).toBe('$0');
  });

  it('rounds float noise to cents', () => {
    expect(formatMoney(291.00999999999976)).toBe('$291.01');
  });
});

describe('formatPercent', () => {
  it.each([
    [60, '60%'],
    [12.5, '12.5%'],
    [110, '110%'],
  ])('formats %s', (value, text) => {
    expect(formatPercent(value)).toBe(text);
  });
});

describe('budgetDetails', () => {
  it('describes a fixed budget', () => {
    expect(budgetDetails(rent)).toBe('Fixed · $2,000 / month');
  });

  it('describes a percentage budget', () => {
    expect(budgetDetails(fun)).toBe('Percentage · 60%');
  });
});

describe('groupBudgets', () => {
  it('keeps first-seen category order', () => {
    expect(groupBudgets([rent, fun, power])).toEqual([
      {
        category: 'Housing',
        budgets: [rent, power],
        fixedTotal: 2089.9,
        percentageTotal: 0,
      },
      {
        category: 'Leisure',
        budgets: [fun],
        fixedTotal: 0,
        percentageTotal: 60,
      },
    ]);
  });

  it('returns no groups for no budgets', () => {
    expect(groupBudgets([])).toEqual([]);
  });
});

describe('formatGroupTotal', () => {
  it('shows the fixed total alone', () => {
    const [group] = groupBudgets([rent, power]);

    expect(formatGroupTotal(group)).toBe('$2,089.90');
  });

  it('shows the percentage total alone', () => {
    const [group] = groupBudgets([fun]);

    expect(formatGroupTotal(group)).toBe('60%');
  });

  it('joins fixed and percentage totals', () => {
    const save: Budget = {
      id: 'save-1',
      name: 'Savings',
      type: 'percentage',
      value: 10,
      category: 'Housing',
    };
    const [group] = groupBudgets([rent, save]);

    expect(formatGroupTotal(group)).toBe('$2,000 · 10%');
  });
});
