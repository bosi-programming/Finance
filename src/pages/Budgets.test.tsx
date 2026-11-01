import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/persistence/db';
import { routeTree } from '@/router';
import { STORAGE_FAILED_MESSAGE, useFinanceStore } from '@/store';
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
  it('opens the add dialog', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');

    await user.click(screen.getByRole('button', { name: 'Add budget' }));

    const dialog = screen.getByRole('dialog', { name: 'Add budget' });
    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toHaveValue(
      '',
    );
    expect(within(dialog).getByRole('textbox', { name: 'Value' })).toHaveValue(
      '',
    );
  });

  it('cancel closes the add dialog without changes', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Add budget' }));
    const dialog = screen.getByRole('dialog', { name: 'Add budget' });

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Rent',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });

  it('Escape closes the add dialog without changes', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Add budget' }));

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });

  it('adds the first budget with a new category', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Add budget' }));
    const dialog = screen.getByRole('dialog', { name: 'Add budget' });

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Rent',
    );
    await user.click(within(dialog).getByRole('combobox', { name: 'Type' }));
    await user.click(screen.getByRole('option', { name: 'Fixed' }));
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '2000',
    );
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(
      screen.getByRole('option', { name: '+ Add new category' }),
    );
    await user.type(
      within(dialog).getByRole('textbox', { name: 'New category' }),
      'Housing',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(useFinanceStore.getState().budgets).toEqual([
      {
        id: expect.any(String) as string,
        name: 'Rent',
        type: 'fixed',
        value: 2000,
        category: 'Housing',
      },
    ]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Housing' })).getByText('Rent'),
    ).toBeInTheDocument();
  });

  it('adds a budget to an existing category', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Add budget' }));
    const dialog = screen.getByRole('dialog', { name: 'Add budget' });

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Fun',
    );
    await user.click(within(dialog).getByRole('combobox', { name: 'Type' }));
    await user.click(screen.getByRole('option', { name: 'Percentage' }));
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '60',
    );
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(screen.getByRole('option', { name: 'Housing' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(useFinanceStore.getState().budgets).toHaveLength(2);
    expect(
      within(screen.getByRole('region', { name: 'Housing' })).getByText(
        '$2,000 · 60%',
      ),
    ).toBeInTheDocument();
  });

  it('offers the categories in use', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent, fun] });
    await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Add budget' }));
    const dialog = screen.getByRole('dialog', { name: 'Add budget' });

    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );

    expect(screen.getByRole('option', { name: 'Housing' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Leisure' })).toBeInTheDocument();
  });

  it('still adds the budget when saving fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(db.appState, 'put').mockRejectedValue(new Error('quota'));
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Add budget' }));
    const dialog = screen.getByRole('dialog', { name: 'Add budget' });

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Fun',
    );
    await user.click(within(dialog).getByRole('combobox', { name: 'Type' }));
    await user.click(screen.getByRole('option', { name: 'Percentage' }));
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '60',
    );
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(screen.getByRole('option', { name: 'Housing' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      STORAGE_FAILED_MESSAGE,
    );
    expect(useFinanceStore.getState().budgets).toHaveLength(2);
    expect(
      within(screen.getByRole('region', { name: 'Housing' })).getByText('Fun'),
    ).toBeInTheDocument();
  });
});
