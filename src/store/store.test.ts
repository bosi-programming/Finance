import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/persistence/db';
import { resetPersistence } from '@/test/resetPersistence';
import { type Budget, type StoredRow } from '@/types/budget';
import {
  IMPORT_FAILED_MESSAGE,
  STORAGE_FAILED_MESSAGE,
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
  beforeEach(resetPersistence);

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

  it('showToast sets the toast', () => {
    const { result } = renderHook(() => useFinanceStore());
    act(() => {
      result.current.showToast('x');
    });
    expect(useFinanceStore.getState().toast).toBe('x');
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

function storedRow() {
  return db.appState.get('current');
}

describe('store persistence', () => {
  beforeEach(resetPersistence);

  it('starts with no toast', () => {
    expect(useFinanceStore.getState().toast).toBeNull();
  });

  it('saves the salary', async () => {
    useFinanceStore.getState().setSalary(SALARY);

    await vi.waitFor(async () => {
      expect((await storedRow())?.salary).toBe(SALARY);
    });
  });

  it('saves added budgets in order', async () => {
    useFinanceStore.getState().addBudget(rentBudget);
    useFinanceStore.getState().addBudget(travelBudget);

    await vi.waitFor(async () => {
      expect((await storedRow())?.budgets).toEqual([rentBudget, travelBudget]);
    });
  });

  it('saves an updated budget', async () => {
    useFinanceStore.getState().addBudget(rentBudget);
    useFinanceStore.getState().addBudget(travelBudget);
    useFinanceStore.getState().updateBudget({ ...rentBudget, name: 'Flat' });

    await vi.waitFor(async () => {
      expect((await storedRow())?.budgets).toEqual([
        { ...rentBudget, name: 'Flat' },
        travelBudget,
      ]);
    });
  });

  it('saves a deletion', async () => {
    useFinanceStore.getState().addBudget(rentBudget);
    useFinanceStore.getState().addBudget(travelBudget);
    useFinanceStore.getState().deleteBudget(rentBudget.id);

    await vi.waitFor(async () => {
      expect((await storedRow())?.budgets).toEqual([travelBudget]);
    });
  });

  it('stores a null salary', async () => {
    useFinanceStore.getState().addBudget(rentBudget);

    await vi.waitFor(async () => {
      expect(await storedRow()).toEqual({
        version: 'v0',
        salary: null,
        budgets: [rentBudget],
      });
    });
  });

  it('keeps memory and shows the toast when a write fails', async () => {
    vi.spyOn(db.appState, 'put').mockRejectedValue(new Error('write failed'));

    useFinanceStore.getState().setSalary(SALARY);

    await vi.waitFor(() => {
      expect(useFinanceStore.getState().toast).toBe(STORAGE_FAILED_MESSAGE);
    });
    expect(useFinanceStore.getState().salary).toBe(SALARY);
  });

  it('runs in memory with no storage', async () => {
    db.close();

    useFinanceStore.getState().setSalary(SALARY);
    useFinanceStore.getState().addBudget(rentBudget);

    expect(useFinanceStore.getState().salary).toBe(SALARY);
    expect(useFinanceStore.getState().budgets).toEqual([rentBudget]);
    await vi.waitFor(() => {
      expect(useFinanceStore.getState().toast).toBe(STORAGE_FAILED_MESSAGE);
    });
  });

  it('keeps memory and row on the import when an edit lands during replaceAll', async () => {
    const imported = {
      version: 'v0' as const,
      salary: 9,
      budgets: [{ ...rentBudget, id: 'imported' }],
    };

    const replacing = useFinanceStore.getState().replaceAll(imported);
    useFinanceStore.getState().addBudget({ ...rentBudget, id: 'edit' });
    await replacing;

    await vi.waitFor(async () => {
      expect(await db.appState.get('current')).toEqual(imported);
    });
    expect(useFinanceStore.getState().salary).toBe(imported.salary);
    expect(useFinanceStore.getState().budgets).toEqual(imported.budgets);
  });

  it('clears the toast', () => {
    useFinanceStore.setState({ toast: 'x' });

    useFinanceStore.getState().clearToast();

    expect(useFinanceStore.getState().toast).toBeNull();
  });
});

describe('hydrate', () => {
  beforeEach(resetPersistence);

  it('sets salary and budgets from a valid row', () => {
    const row: StoredRow = { version: 'v0', salary: 9, budgets: [rentBudget] };

    useFinanceStore.getState().hydrate(row);

    expect(useFinanceStore.getState().salary).toBe(9);
    expect(useFinanceStore.getState().budgets).toEqual([rentBudget]);
  });

  it('reads undefined as empty', () => {
    useFinanceStore.setState({ salary: 5, budgets: [rentBudget] });

    useFinanceStore.getState().hydrate(undefined);

    expect(useFinanceStore.getState().salary).toBeNull();
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });

  it('reads a bad row as empty', () => {
    useFinanceStore.setState({ salary: 5, budgets: [rentBudget] });

    useFinanceStore.getState().hydrate({ version: 'v0', salary: 'x' });

    expect(useFinanceStore.getState().salary).toBeNull();
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });

  it('does not write or touch the toast', () => {
    const put = vi.spyOn(db.appState, 'put');

    useFinanceStore
      .getState()
      .hydrate({ version: 'v0', salary: 1, budgets: [] });

    expect(put).not.toHaveBeenCalled();
    expect(useFinanceStore.getState().toast).toBeNull();
  });

  it('leaves a bad row in place', async () => {
    const bad = { version: 'v9' } as unknown as StoredRow;
    await db.appState.put(bad, 'current');

    useFinanceStore.getState().hydrate(bad);

    expect(await storedRow()).toEqual(bad);
  });

  it('replaces a bad row on the next write', async () => {
    const bad = { version: 'v9' } as unknown as StoredRow;
    await db.appState.put(bad, 'current');
    useFinanceStore.getState().hydrate(bad);

    useFinanceStore.getState().setSalary(SALARY);

    await vi.waitFor(async () => {
      expect(await storedRow()).toEqual({
        version: 'v0',
        salary: SALARY,
        budgets: [],
      });
    });
  });
});

describe('replaceAll', () => {
  beforeEach(resetPersistence);

  const incoming = {
    version: 'v0' as const,
    salary: 8,
    budgets: [travelBudget],
  };

  it('replaces memory and the row', async () => {
    useFinanceStore.setState({ salary: 1, budgets: [rentBudget] });

    const ok = await useFinanceStore.getState().replaceAll(incoming);

    expect(ok).toBe(true);
    expect(useFinanceStore.getState().salary).toBe(8);
    expect(useFinanceStore.getState().budgets).toEqual([travelBudget]);
    expect(await storedRow()).toEqual(incoming);
  });

  it('keeps memory and shows the failure toast when the write fails', async () => {
    useFinanceStore.setState({ salary: 1, budgets: [rentBudget] });
    vi.spyOn(db.appState, 'put').mockRejectedValue(new Error('write failed'));

    const ok = await useFinanceStore.getState().replaceAll(incoming);

    expect(ok).toBe(false);
    expect(useFinanceStore.getState().salary).toBe(1);
    expect(useFinanceStore.getState().budgets).toEqual([rentBudget]);
    expect(useFinanceStore.getState().toast).toBe(IMPORT_FAILED_MESSAGE);
  });
});
