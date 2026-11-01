import { describe, expect, it } from 'vitest';

import { roundToCents } from '@/domain/money';
import type { Budget } from '@/types/budget';
import { allocateBudgets } from './allocateBudgets';

const rentBudget: Budget = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
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

describe('allocateBudgets result shape', () => {
  it('returns every AllocationResult field on a happy path', () => {
    const result = allocateBudgets(5000, [rentBudget, travelBudget]);
    expect(result).toHaveProperty('salary', 5000);
    expect(result).toHaveProperty('fixedTotal');
    expect(result).toHaveProperty('percentageTotal');
    expect(result).toHaveProperty('remainder');
    expect(result).toHaveProperty('remaining');
    expect(result).toHaveProperty('allocations');
    expect(result).toHaveProperty('categoryTotals');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('warning');
  });
});

describe('allocateBudgets allocations', () => {
  it('allocates percentages against the remainder after fixed budgets', () => {
    const result = allocateBudgets(5000, [
      rentBudget,
      travelBudget,
      savingsBudget,
    ]);
    expect(result.fixedTotal).toBe(2000);
    expect(result.remainder).toBe(3000);
    expect(result.percentageTotal).toBe(2700);
    expect(result.remaining).toBe(300);
    expect(result.allocations).toEqual([
      { ...rentBudget, amount: 2000 },
      { ...travelBudget, amount: 1800 },
      { ...savingsBudget, amount: 900 },
    ]);
  });

  it('preserves the input order of budgets in allocations', () => {
    const result = allocateBudgets(5000, [
      travelBudget,
      rentBudget,
      savingsBudget,
    ]);
    expect(result.allocations.map((a) => a.id)).toEqual([
      'travel-1',
      'rent-1',
      'savings-1',
    ]);
  });

  it('carries the original fixed value through as amount', () => {
    const result = allocateBudgets(5000, [rentBudget]);
    expect(result.allocations[0]).toEqual({ ...rentBudget, amount: 2000 });
  });

  it('rounds a negative allocation the same way as a positive one', () => {
    const result = allocateBudgets(0, [
      { ...rentBudget, value: 11.15 },
      { ...travelBudget, value: 10 },
    ]);
    expect(result.allocations[1].amount).toBe(-1.12);
  });

  it.each([
    [5000.05, [50, 50]],
    [10, [33.33, 33.33, 33.34]],
  ])(
    'leaves no Remaining at a sum of 100 when salary %s does not split evenly',
    (salary, values) => {
      const result = allocateBudgets(
        salary,
        values.map((value, index) => ({
          ...travelBudget,
          id: `percent-${String(index)}`,
          value,
        })),
      );
      const allocated = result.allocations.reduce(
        (sum, allocation) => sum + allocation.amount,
        0,
      );
      expect(result.remaining).toBe(0);
      expect(roundToCents(allocated)).toBe(salary);
    },
  );

  it('reconciles allocations plus remaining to the salary to the penny', () => {
    const thirdBudget: Budget = {
      id: 'third-1',
      name: 'Third',
      type: 'percentage',
      value: 33.33,
      category: 'Third',
    };
    const result = allocateBudgets(1000, [
      { ...thirdBudget, id: 'a-1', name: 'A' },
      { ...thirdBudget, id: 'b-1', name: 'B' },
      { ...thirdBudget, id: 'c-1', name: 'C' },
    ]);
    const allocatedSum = result.allocations.reduce(
      (sum, allocation) => sum + allocation.amount,
      0,
    );
    expect(allocatedSum + result.remaining).toBe(1000);
  });
});

describe('allocateBudgets categoryTotals', () => {
  it('sums final amounts per category', () => {
    const internetBudget: Budget = {
      id: 'internet-1',
      name: 'Internet',
      type: 'percentage',
      value: 10,
      category: 'Housing',
    };
    const result = allocateBudgets(5000, [
      rentBudget,
      internetBudget,
      savingsBudget,
    ]);
    expect(result.categoryTotals).toEqual({
      Housing: 2300,
      Savings: 900,
    });
  });
});

describe('allocateBudgets error flag', () => {
  it('sets error when percentage values sum above 100 but still computes allocations', () => {
    const extraBudget: Budget = {
      id: 'extra-1',
      name: 'Extra',
      type: 'percentage',
      value: 50,
      category: 'Extra',
    };
    const result = allocateBudgets(5000, [
      rentBudget,
      travelBudget,
      extraBudget,
    ]);
    expect(result.error).toBe('Percentage budgets cannot exceed 100%');
    expect(result.allocations).toHaveLength(3);
  });

  it('leaves error null when percentage values sum to exactly 100', () => {
    const fortyPercent: Budget = {
      id: 'forty-1',
      name: 'Forty',
      type: 'percentage',
      value: 40,
      category: 'Forty',
    };
    const result = allocateBudgets(1000, [travelBudget, fortyPercent]);
    expect(result.error).toBeNull();
    expect(result.remaining).toBe(0);
  });

  it('sets no error when percentages reach 100 with float noise', () => {
    const result = allocateBudgets(5000, [
      { ...travelBudget, value: 0.01 },
      { ...travelBudget, id: 'travel-2', value: 70.68 },
      { ...travelBudget, id: 'travel-3', value: 29.31 },
    ]);
    expect(result.error).toBeNull();
  });
});

describe('allocateBudgets warning flag', () => {
  it('sets warning when fixed total exceeds salary and reports the negative remainder', () => {
    const oversizedRent: Budget = { ...rentBudget, value: 6000 };
    const fiftyPercent: Budget = {
      id: 'fifty-1',
      name: 'Fifty',
      type: 'percentage',
      value: 50,
      category: 'Fifty',
    };
    const result = allocateBudgets(5000, [oversizedRent, fiftyPercent]);
    expect(result.warning).toBe('Fixed budgets exceed the salary');
    expect(result.remainder).toBe(-1000);
    expect(result.remaining).toBe(-500);
  });

  it('leaves warning null when fixed total equals salary', () => {
    const result = allocateBudgets(2000, [rentBudget, travelBudget]);
    expect(result.warning).toBeNull();
    expect(result.remainder).toBe(0);
    expect(result.allocations[1].amount).toBe(0);
  });
});

describe('allocateBudgets combined flags', () => {
  it('sets error and warning together', () => {
    const oversizedRent: Budget = { ...rentBudget, value: 6000 };
    const extraBudget: Budget = {
      id: 'extra-1',
      name: 'Extra',
      type: 'percentage',
      value: 50,
      category: 'Extra',
    };
    const result = allocateBudgets(5000, [
      oversizedRent,
      travelBudget,
      extraBudget,
    ]);
    expect(result.error).toBe('Percentage budgets cannot exceed 100%');
    expect(result.warning).toBe('Fixed budgets exceed the salary');
  });
});

describe('allocateBudgets edge cases', () => {
  it('returns zeros and no flags for a zero salary', () => {
    const result = allocateBudgets(0, [travelBudget]);
    expect(result.fixedTotal).toBe(0);
    expect(result.percentageTotal).toBe(0);
    expect(result.remainder).toBe(0);
    expect(result.remaining).toBe(0);
    expect(result.allocations[0].amount).toBe(0);
    expect(result.error).toBeNull();
    expect(result.warning).toBeNull();
  });

  it('returns the salary as remaining for empty budgets', () => {
    const result = allocateBudgets(5000, []);
    expect(result.allocations).toEqual([]);
    expect(result.categoryTotals).toEqual({});
    expect(result.remaining).toBe(5000);
    expect(result.fixedTotal).toBe(0);
    expect(result.error).toBeNull();
    expect(result.warning).toBeNull();
  });

  it('leaves a positive remaining on a partial allocation', () => {
    const result = allocateBudgets(1000, [travelBudget]);
    expect(result.remaining).toBe(400);
    expect(result.allocations[0].amount).toBe(600);
  });

  it('does not mutate frozen inputs', () => {
    const budgets = Object.freeze([
      Object.freeze(rentBudget),
      Object.freeze(travelBudget),
    ]) as Budget[];
    const snapshot = budgets.map((budget) => ({ ...budget }));
    allocateBudgets(5000, budgets);
    expect(budgets.map((budget) => ({ ...budget }))).toEqual(snapshot);
  });

  it('normalizes a negative zero allocation to zero', () => {
    const zeroPercent: Budget = {
      id: 'zero-1',
      name: 'Zero',
      type: 'percentage',
      value: 0,
      category: '',
    };
    const oversizedRent: Budget = { ...rentBudget, value: 6000 };
    const result = allocateBudgets(5000, [oversizedRent, zeroPercent]);
    expect(result.allocations[1].amount).toBe(0);
  });

  it('passes a negative percentage value through without throwing', () => {
    const negativeBudget: Budget = {
      id: 'negative-1',
      name: 'Negative',
      type: 'percentage',
      value: -50,
      category: 'Negative',
    };
    const result = allocateBudgets(1000, [negativeBudget]);
    expect(result.allocations[0].amount).toBe(-500);
    expect(result.error).toBeNull();
  });
});
