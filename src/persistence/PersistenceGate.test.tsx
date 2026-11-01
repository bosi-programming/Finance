import { act, render, screen, waitFor } from '@testing-library/react';
import Dexie from 'dexie';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_FAILED_MESSAGE, useFinanceStore } from '@/store';
import { resetPersistence } from '@/test/resetPersistence';
import { db } from '@/persistence/db';
import { persist } from '@/persistence/sync';
import { type StoredRow } from '@/types/budget';
import { PersistenceGate } from './PersistenceGate';

const rent = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed' as const,
  value: 2000,
  category: 'Housing',
};

const row: StoredRow = { version: 'v0', salary: 4000, budgets: [rent] };

function Child() {
  const salary = useFinanceStore((state) => state.salary);
  const count = useFinanceStore((state) => state.budgets.length);
  return <p>{`child salary=${String(salary)} budgets=${String(count)}`}</p>;
}

function secondConnection() {
  const other = new Dexie('finance-fe');
  other.version(1).stores({ appState: '' });
  return other;
}

describe('PersistenceGate load', () => {
  beforeEach(resetPersistence);

  it('hydrates from a stored row', async () => {
    await db.appState.put(row, 'current');

    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );

    expect(
      await screen.findByText('child salary=4000 budgets=1'),
    ).toBeVisible();
  });

  it('treats no row as empty', async () => {
    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );

    expect(
      await screen.findByText('child salary=null budgets=0'),
    ).toBeVisible();
  });

  it('holds children until the first read', async () => {
    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );

    expect(screen.queryByText(/child salary/)).not.toBeInTheDocument();
    expect(await screen.findByText(/child salary/)).toBeVisible();
  });

  it('works under StrictMode', async () => {
    await db.appState.put(row, 'current');

    render(
      <StrictMode>
        <PersistenceGate>
          <Child />
        </PersistenceGate>
      </StrictMode>,
    );

    expect(
      await screen.findByText('child salary=4000 budgets=1'),
    ).toBeVisible();
  });

  it('does not write while hydrating', async () => {
    await db.appState.put(row, 'current');
    const put = vi.spyOn(db.appState, 'put');

    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );
    await screen.findByText('child salary=4000 budgets=1');

    expect(put).not.toHaveBeenCalled();
  });
});

describe('PersistenceGate storage unavailable', () => {
  beforeEach(resetPersistence);

  it('opens with no IndexedDB API', async () => {
    Dexie.dependencies.indexedDB = null as unknown as IDBFactory;

    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );

    expect(screen.getByText('child salary=null budgets=0')).toBeVisible();
    await waitFor(() => {
      expect(useFinanceStore.getState().toast).toBe(STORAGE_FAILED_MESSAGE);
    });
  });

  it('opens after a failed read', async () => {
    db.close();

    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );

    expect(await screen.findByText(/child salary/)).toBeVisible();
    await waitFor(() => {
      expect(useFinanceStore.getState().toast).toBe(STORAGE_FAILED_MESSAGE);
    });
  });

  it('keeps memory after a failed read', async () => {
    useFinanceStore.setState({ salary: 7, budgets: [rent] });
    db.close();

    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );
    await screen.findByText(/child salary/);

    expect(useFinanceStore.getState().salary).toBe(7);
    expect(useFinanceStore.getState().budgets).toEqual([rent]);
  });
});

describe('PersistenceGate bad stored row', () => {
  beforeEach(resetPersistence);

  it('reads a bad row as empty and leaves it in place', async () => {
    const bad = { version: 'v9', salary: 'x' } as unknown as StoredRow;
    await db.appState.put(bad, 'current');

    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );
    await screen.findByText('child salary=null budgets=0');

    expect(await db.appState.get('current')).toEqual(bad);
  });
});

describe('PersistenceGate stale results', () => {
  beforeEach(resetPersistence);

  it('drops a result that started before a local write', async () => {
    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );
    await screen.findByText('child salary=null budgets=0');
    const release = vi.fn<(value: StoredRow) => void>();
    vi.spyOn(db.appState, 'get').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release.mockImplementation(resolve);
        }) as ReturnType<typeof db.appState.get>,
    );
    await act(async () => {
      await db.appState.put(row, 'current');
    });
    await waitFor(() => {
      expect(release.getMockImplementation()).toBeDefined();
    });
    const salaries: (number | null)[] = [];
    const unsubscribe = useFinanceStore.subscribe((state) => {
      salaries.push(state.salary);
    });

    await act(async () => {
      useFinanceStore.getState().setSalary(1);
      release(row);
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    });
    unsubscribe();

    expect(salaries).not.toContain(row.salary);
    expect(useFinanceStore.getState().salary).toBe(1);
  });

  it('keeps every local edit after a foreign write', async () => {
    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );
    await screen.findByText(/child salary/);
    const other = secondConnection();

    await act(async () => {
      await other.table('appState').put(row, 'current');
      useFinanceStore.getState().setSalary(1);
      useFinanceStore.getState().addBudget(rent);
      useFinanceStore.getState().addBudget({ ...rent, id: 'rent-2' });
    });

    await waitFor(async () => {
      expect(await db.appState.get('current')).toEqual({
        version: 'v0',
        salary: 1,
        budgets: [rent, { ...rent, id: 'rent-2' }],
      });
    });
    expect(useFinanceStore.getState().salary).toBe(1);
    expect(useFinanceStore.getState().budgets).toEqual([
      rent,
      { ...rent, id: 'rent-2' },
    ]);
    other.close();
  });
});

describe('PersistenceGate other tabs', () => {
  beforeEach(resetPersistence);

  it('follows a write from another connection', async () => {
    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );
    await screen.findByText('child salary=null budgets=0');
    const other = secondConnection();

    await other.table('appState').put(row, 'current');

    expect(
      await screen.findByText('child salary=4000 budgets=1'),
    ).toBeVisible();
    other.close();
  });

  it('converges on concurrent writes', async () => {
    render(
      <PersistenceGate>
        <Child />
      </PersistenceGate>,
    );
    await screen.findByText(/child salary/);
    const other = secondConnection();

    await act(async () => {
      await Promise.all([
        other
          .table('appState')
          .put({ version: 'v0', salary: 11, budgets: [] }, 'current'),
        persist({ version: 'v0', salary: 22, budgets: [] }),
      ]);
    });

    await waitFor(async () => {
      const stored = await db.appState.get('current');
      expect(useFinanceStore.getState().salary).toBe(stored?.salary);
    });
    other.close();
  });
});
