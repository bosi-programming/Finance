import type { Budget } from '@/types/budget';
import { describe, expect, it } from 'vitest';
import {
  filterBudgetByName,
  getFixedBudgetsTotal,
  getNetSalary,
  getPercentageBudgetValues,
  getTotalPercentage,
  useFinanceStore,
} from './store';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

describe('filterBudgetByName', () => {
  it('should return correct budget', () => {
    const filteredBudget = filterBudgetByName(budgets, budgets[0]);
    expect(filteredBudget).toStrictEqual([budgets[1], budgets[2], budgets[3]]);
  });
  it('should return all budgets', () => {
    const filteredBudget = filterBudgetByName(budgets, {
      ...budgets[0],
      name: 'banana',
    });
    expect(filteredBudget).toStrictEqual(budgets);
  });
});
describe('getFixedBudgetsTotal', () => {
  it('Should return the total', () => {
    const fixedTotal = getFixedBudgetsTotal(budgets);
    expect(fixedTotal).toBe(109.9);
  });
});
describe('getNetSalary', () => {
  it('Should return the net salary', () => {
    const netSalary = getNetSalary(salary, budgets);
    expect(netSalary).toBe(salary - 109.9);
  });
});
describe('getTotalPercentage', () => {
  it('Should return the total on percentage', () => {
    const percentage = getTotalPercentage(budgets);
    expect(percentage).toBe(1);
  });
});
describe('getPercentageBudgetValues', () => {
  it('Should return the total of percentage on money', () => {
    const total = getPercentageBudgetValues(salary, budgets);
    expect(total).toStrictEqual([
      { ...budgets[2], value: 889.01 },
      { ...budgets[3], value: 8001.09 },
    ]);
  });
});
describe('useFinanceStore', () => {
  it('should start correct', () => {
    const { result } = renderHook(() => useFinanceStore());
    expect(result.current.salary).toBe(null);
    expect(result.current.budgets).toStrictEqual([]);
  });
  it('should set salary', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.setSalary(100);
    });
    expect(result.current.salary).toBe(100);
  });
  it('should add budget', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(budgets[0]);
    });
    expect(result.current.budgets).toStrictEqual([budgets[0]]);
  });
  it('should update budget', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(budgets[0]);
    });
    act(() => {
      result.current.updateBudget({ ...budgets[0], value: 2000 });
    });
    expect(result.current.budgets).toStrictEqual([
      { ...budgets[0], value: 2000 },
    ]);
  });
  it('should delete budget', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.addBudget(budgets[0]);
    });
    act(() => {
      result.current.deleteBudget(budgets[0]);
    });
    expect(result.current.budgets).toStrictEqual([]);
  });
});

const salary = 9000;
const budgets: Budget[] = [
  {
    name: 'first fixed',
    type: 'fixed',
    value: 10,
    category: 'any',
  },
  {
    name: 'second fixed',
    type: 'fixed',
    value: 99.9,
    category: 'any',
  },
  {
    name: 'first percentage',
    type: 'percentage',
    value: 0.1,
    category: 'any',
  },
  {
    name: 'second percentage',
    type: 'percentage',
    value: 0.9,
    category: 'any',
  },
];
