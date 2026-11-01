import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeTree } from '@/router';
import { useFinanceStore } from '@/store';
import { resetPersistence } from '@/test/resetPersistence';
import type { Budget } from '@/types/budget';

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
const save: Budget = {
  id: 'save-1',
  name: 'Savings',
  type: 'percentage',
  value: 10,
  category: 'Housing',
};

async function renderRoute(path: string) {
  const testRouter = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await testRouter.load();
  render(<RouterProvider router={testRouter} />);
  return testRouter;
}

describe('Budgets page', () => {
  beforeEach(resetPersistence);

  it('shows the empty state with no budgets', async () => {
    await renderRoute('/budgets');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your budgets' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'No budgets yet. Add your first one to split your salary.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('region')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'See result' }),
    ).not.toBeInTheDocument();
  });

  it('lists budgets grouped by category', async () => {
    useFinanceStore.setState({ budgets: [rent, power, fun] });
    await renderRoute('/budgets');

    expect(
      screen.getByText('Add, edit, and delete fixed and percentage budgets.'),
    ).toBeInTheDocument();
    const regions = screen.getAllByRole('region');
    expect(regions).toHaveLength(2);
    expect(regions[0]).toBe(screen.getByRole('region', { name: 'Housing' }));
    expect(regions[1]).toBe(screen.getByRole('region', { name: 'Leisure' }));
    expect(
      within(screen.getByRole('region', { name: 'Housing' })).getByText(
        '$2,089.90',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Leisure' })).getByText('60%'),
    ).toBeInTheDocument();
  });

  it("shows each budget's details", async () => {
    useFinanceStore.setState({ budgets: [rent, fun] });
    await renderRoute('/budgets');

    const housing = screen.getByRole('region', { name: 'Housing' });
    expect(within(housing).getByText('Rent')).toBeInTheDocument();
    expect(
      within(housing).getByText('Fixed · $2,000 / month'),
    ).toBeInTheDocument();
    const leisure = screen.getByRole('region', { name: 'Leisure' });
    expect(within(leisure).getByText('Fun')).toBeInTheDocument();
    expect(within(leisure).getByText('Percentage · 60%')).toBeInTheDocument();
  });

  it('shows a mixed category total', async () => {
    useFinanceStore.setState({ budgets: [rent, save] });
    await renderRoute('/budgets');

    expect(
      within(screen.getByRole('region', { name: 'Housing' })).getByText(
        '$2,000 · 10%',
      ),
    ).toBeInTheDocument();
  });
});
