import { describe, expect, it } from 'vitest';

import { type Budget } from '@/types/budget';

import {
  getFixedBudgetsTotal,
  getNetSalary,
  getTotalPercentage,
} from './totals';

const SALARY = 5000;

const rentBudget: Budget = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
};

const internetBudget: Budget = {
  id: 'internet-1',
  name: 'Internet',
  type: 'fixed',
  value: 150,
  category: 'Subscriptions',
};

const travelBudget: Budget = {
  id: 'travel-1',
  name: 'Travel',
  type: 'percentage',
  value: 60,
  category: 'Hobbies',
};

const savingsBudget: Budget = {
  id: 'savings-1',
  name: 'Savings',
  type: 'percentage',
  value: 30,
  category: 'Savings',
};

const mixedBudgets = [rentBudget, travelBudget, internetBudget, savingsBudget];

describe('getFixedBudgetsTotal', () => {
  it('sums only the fixed budgets in a mixed list', () => {
    expect(getFixedBudgetsTotal(mixedBudgets)).toBe(2150);
  });

  it('returns 0 when there are no fixed budgets', () => {
    expect(getFixedBudgetsTotal([travelBudget, savingsBudget])).toBe(0);
  });
});

describe('getNetSalary', () => {
  it('subtracts the fixed total from the salary', () => {
    expect(getNetSalary(SALARY, mixedBudgets)).toBe(2850);
  });

  it('returns null when the salary is null', () => {
    expect(getNetSalary(null, mixedBudgets)).toBeNull();
  });
});

describe('getTotalPercentage', () => {
  it('sums percentage values in percent units', () => {
    expect(getTotalPercentage(mixedBudgets)).toBe(90);
  });

  it('returns 0 when there are no percentage budgets', () => {
    expect(getTotalPercentage([rentBudget, internetBudget])).toBe(0);
  });
});
