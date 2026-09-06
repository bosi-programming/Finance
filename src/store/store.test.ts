import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Budget } from '@/types/budget';
import {
  getFixedBudgetsTotal,
  getNetSalary,
  getTotalPercentage,
  useFinanceStore,
} from './store';

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

describe('useFinanceStore', () => {
  beforeEach(() => {
    useFinanceStore.setState({ salary: null, budgets: [] });
  });

  it('starts with an unset salary and no budgets', () => {
    const { result } = renderHook(() => useFinanceStore());
    expect(result.current.salary).toBeNull();
    expect(result.current.budgets).toEqual([]);
  });

  it('updates the salary', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.setSalary(SALARY);
    });
    expect(result.current.salary).toBe(SALARY);
  });

  it('appends budgets in order', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(rentBudget);
      result.current.addBudget(travelBudget);
    });
    expect(result.current.budgets).toEqual([rentBudget, travelBudget]);
  });

  it('replaces the budget with the matching id and keeps its position', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(rentBudget);
      result.current.addBudget(travelBudget);
    });
    act(() => {
      result.current.updateBudget({ ...rentBudget, name: 'Apartment' });
    });
    expect(result.current.budgets).toEqual([
      { ...rentBudget, name: 'Apartment' },
      travelBudget,
    ]);
  });

  it('leaves budgets unchanged when updating an unknown id', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(rentBudget);
    });
    act(() => {
      result.current.updateBudget({ ...rentBudget, id: 'unknown-1' });
    });
    expect(result.current.budgets).toEqual([rentBudget]);
  });

  it('removes the budget with the matching id', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(rentBudget);
      result.current.addBudget(internetBudget);
      result.current.addBudget(savingsBudget);
    });
    act(() => {
      result.current.deleteBudget(rentBudget.id);
    });
    expect(result.current.budgets).toEqual([internetBudget, savingsBudget]);
  });

  it('leaves budgets unchanged when deleting an unknown id', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(rentBudget);
    });
    act(() => {
      result.current.deleteBudget('unknown-1');
    });
    expect(result.current.budgets).toEqual([rentBudget]);
  });

  it('derives net salary, fixed total, and percentage total from state', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.setSalary(SALARY);
      mixedBudgets.forEach((budget) => {
        result.current.addBudget(budget);
      });
    });
    expect(result.current.getTotalFixed()).toBe(2150);
    expect(result.current.getTotalPercentage()).toBe(90);
    expect(result.current.getNetSalary()).toBe(2850);
  });

  it('keeps totals computable and net salary null while salary is unset', () => {
    const { result } = renderHook(() => useFinanceStore());
    expect(result.current.getNetSalary()).toBeNull();
    expect(result.current.getTotalFixed()).toBe(0);
    expect(result.current.getTotalPercentage()).toBe(0);
    act(() => {
      result.current.addBudget(rentBudget);
      result.current.addBudget(travelBudget);
    });
    expect(result.current.getNetSalary()).toBeNull();
    expect(result.current.getTotalFixed()).toBe(2000);
    expect(result.current.getTotalPercentage()).toBe(60);
  });

  it('starts each case from a clean state', () => {
    const { result } = renderHook(() => useFinanceStore());
    expect(result.current.salary).toBeNull();
    expect(result.current.budgets).toEqual([]);
  });
});
