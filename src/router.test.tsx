import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeTree } from './router';
import { db } from '@/persistence/db';
import { PersistenceGate } from '@/persistence/PersistenceGate';
import { useFinanceStore } from '@/store';
import { resetPersistence } from '@/test/resetPersistence';
import type { Budget, StoredRow } from '@/types/budget';

const rent: Budget = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
};

async function reloadRoute(path: string, row: StoredRow) {
  await db.appState.put(row, 'current');
  const testRouter = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(
    <PersistenceGate>
      <RouterProvider router={testRouter} />
    </PersistenceGate>,
  );
  return testRouter;
}

async function renderRoute(path: string) {
  const testRouter = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await testRouter.load();

  render(<RouterProvider router={testRouter} />);
  return testRouter;
}

describe('router', () => {
  beforeEach(resetPersistence);

  it('renders the Home route with a heading and a Button', async () => {
    await renderRoute('/');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Home' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Primary action' }),
    ).toBeInTheDocument();
  });

  it('renders the Salary route with an Input', async () => {
    await renderRoute('/salary');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "What's your gross salary?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Gross salary' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('$ 0.00')).toBeInTheDocument();
  });

  it('Continue on /salary lands on /budgets', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Gross salary' }),
      '5000',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
  });

  it('renders the Budgets route', async () => {
    useFinanceStore.setState({ salary: 5000 });
    await renderRoute('/budgets');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your budgets' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'No budgets yet. Add your first one to split your salary.',
      ),
    ).toBeInTheDocument();
  });

  it('redirects /budgets to /salary with no salary', async () => {
    const testRouter = await renderRoute('/budgets');

    expect(testRouter.state.location.pathname).toBe('/salary');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "What's your gross salary?",
      }),
    ).toBeInTheDocument();
  });

  it('keeps a Budgets link click on /salary with no salary', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.click(screen.getByRole('link', { name: 'Budgets' }));

    await waitFor(() => {
      expect(testRouter.state.status).toBe('idle');
    });
    expect(testRouter.state.location.pathname).toBe('/salary');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "What's your gross salary?",
      }),
    ).toBeInTheDocument();
  });

  it('redirects /result to /salary with no salary', async () => {
    const testRouter = await renderRoute('/result');

    expect(testRouter.state.location.pathname).toBe('/salary');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "What's your gross salary?",
      }),
    ).toBeInTheDocument();
  });

  it('keeps a Result link click on /salary with no salary', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.click(screen.getByRole('link', { name: 'Result' }));

    await waitFor(() => {
      expect(testRouter.state.status).toBe('idle');
    });
    expect(testRouter.state.location.pathname).toBe('/salary');
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Result' }),
    ).not.toBeInTheDocument();
  });

  it('redirects /result to /budgets with a salary and no budgets', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [] });
    const testRouter = await renderRoute('/result');

    expect(testRouter.state.location.pathname).toBe('/budgets');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Your budgets' }),
    ).toBeInTheDocument();
  });

  it('replaces the blocked entry on redirect', async () => {
    const testRouter = await renderRoute('/result');

    expect(testRouter.state.location.pathname).toBe('/salary');
    expect(testRouter.history.length).toBe(1);
  });

  it('stays on /budgets on reload with a stored salary', async () => {
    const testRouter = await reloadRoute('/budgets', {
      version: 'v0',
      salary: 4000,
      budgets: [],
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your budgets' }),
    ).toBeInTheDocument();
    expect(testRouter.state.location.pathname).toBe('/budgets');
  });

  it('stays on /result on reload with a stored plan', async () => {
    const testRouter = await reloadRoute('/result', {
      version: 'v0',
      salary: 4000,
      budgets: [rent],
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Result' }),
    ).toBeInTheDocument();
    expect(testRouter.state.location.pathname).toBe('/result');
  });

  it('sends a reload of /result with no stored budgets to /budgets', async () => {
    const testRouter = await reloadRoute('/result', {
      version: 'v0',
      salary: 4000,
      budgets: [],
    });

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your budgets' }),
    ).toBeInTheDocument();
  });

  it.each(['/', '/salary', '/budgets', '/result'])(
    'replaces the placeholder on %s',
    async (path) => {
      await renderRoute(path);

      expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
    },
  );
});
