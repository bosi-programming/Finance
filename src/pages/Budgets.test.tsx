import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/i18n';
import { db } from '@/persistence/db';
import { routeTree } from '@/router';
import { storageFailedMessage, useFinanceStore } from '@/store';
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

const trips: Budget = {
  id: 'trips-1',
  name: 'Trips',
  type: 'percentage',
  value: 50,
  category: 'Leisure',
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
  beforeEach(async () => {
    await resetPersistence();
    useFinanceStore.setState({ salary: 5000 });
  });

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

  it('titles each budget card under its category heading', async () => {
    useFinanceStore.setState({ budgets: [rent, fun] });
    await renderRoute('/budgets');

    const housing = screen.getByRole('region', { name: 'Housing' });
    expect(
      within(housing).getByRole('heading', { level: 2, name: 'Housing' }),
    ).toBeInTheDocument();
    expect(
      within(housing).getByRole('heading', { level: 3, name: 'Rent' }),
    ).toBeInTheDocument();
  });

  it('puts Delete before Edit on each budget card', async () => {
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');

    const remove = screen.getByRole('button', { name: 'Delete Rent' });
    const edit = screen.getByRole('button', { name: 'Edit Rent' });
    expect(
      remove.compareDocumentPosition(edit) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
    await user.click(within(dialog).getByRole('combobox', { name: 'Type' }));
    await user.click(screen.getByRole('option', { name: 'Fixed' }));
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '2000',
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
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '60',
    );
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(screen.getByRole('option', { name: 'Housing' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(useFinanceStore.getState().budgets).toEqual([
      rent,
      {
        id: expect.any(String) as string,
        name: 'Fun',
        type: 'fixed',
        value: 60,
        category: 'Housing',
      },
    ]);
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
      storageFailedMessage(),
    );
    expect(useFinanceStore.getState().budgets).toHaveLength(2);
    expect(
      within(screen.getByRole('region', { name: 'Housing' })).getByText('Fun'),
    ).toBeInTheDocument();
  });

  async function openAddDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Add budget' }));
    return screen.getByRole('dialog', { name: 'Add budget' });
  }

  async function pickType(
    user: ReturnType<typeof userEvent.setup>,
    dialog: HTMLElement,
    option: 'Fixed' | 'Percentage',
  ) {
    await user.click(within(dialog).getByRole('combobox', { name: 'Type' }));
    await user.click(screen.getByRole('option', { name: option }));
  }

  async function pickCategory(
    user: ReturnType<typeof userEvent.setup>,
    dialog: HTMLElement,
    option: string,
  ) {
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(screen.getByRole('option', { name: option }));
  }

  it('shows every error on an empty save', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      within(dialog).getByText('Enter a budget name.'),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText('Choose a budget type.'),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByText('Choose a category.')).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'Add budget' }),
    ).toBeInTheDocument();
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });

  it('shows the type error on a new category without a type', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    await pickCategory(user, dialog, '+ Add new category');

    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      within(dialog).getByText('Choose a budget type.'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('combobox', { name: 'Type' }),
    ).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects a blank name', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    const name = within(dialog).getByRole('textbox', { name: 'Name' });

    await user.type(name, '   ');
    await pickCategory(user, dialog, '+ Add new category');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'New category' }),
      'Housing',
    );
    await pickType(user, dialog, 'Fixed');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '2000',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      within(dialog).getByText('Enter a budget name.'),
    ).toBeInTheDocument();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });

  it('rejects a fixed value of zero', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await pickCategory(user, dialog, '+ Add new category');
    await pickType(user, dialog, 'Fixed');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '0',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      within(dialog).getByText('Enter an amount above $ 0.00.'),
    ).toBeInTheDocument();
  });

  it('rejects a percentage above 100', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await pickCategory(user, dialog, '+ Add new category');
    await pickType(user, dialog, 'Percentage');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '101',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      within(dialog).getByText('Enter a percentage between 0 and 100.'),
    ).toBeInTheDocument();
  });

  it('rejects an empty new category', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await pickCategory(user, dialog, '+ Add new category');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(within(dialog).getByText('Choose a category.')).toBeInTheDocument();
  });

  it("clears a field's error on its next edit", async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'R');

    expect(
      within(dialog).queryByText('Enter a budget name.'),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByText('Choose a category.')).toBeInTheDocument();
  });

  it('clears the value error on the next value edit', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    await pickCategory(user, dialog, '+ Add new category');
    await pickType(user, dialog, 'Fixed');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(
      within(dialog).getByText('Enter an amount above $ 0.00.'),
    ).toBeInTheDocument();

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '5',
    );

    expect(
      within(dialog).queryByText('Enter an amount above $ 0.00.'),
    ).not.toBeInTheDocument();
  });

  it('clears the category error on choosing a category', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(screen.getByRole('option', { name: 'Housing' }));

    expect(
      within(dialog).queryByText('Choose a category.'),
    ).not.toBeInTheDocument();
  });

  it('clears the category error on adding a new category', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(
      screen.getByRole('option', { name: '+ Add new category' }),
    );

    expect(
      within(dialog).queryByText('Choose a category.'),
    ).not.toBeInTheDocument();
  });

  it('allows duplicate names', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Rent',
    );
    await pickCategory(user, dialog, 'Housing');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '2000',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    const budgets = useFinanceStore.getState().budgets;
    expect(budgets).toHaveLength(2);
    expect(budgets.map((budget) => budget.name)).toEqual(['Rent', 'Rent']);
  });

  it('swaps the value placeholder with the type', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    const value = within(dialog).getByRole('textbox', { name: 'Value' });

    await pickCategory(user, dialog, '+ Add new category');
    await pickType(user, dialog, 'Fixed');
    expect(value).toHaveAttribute('placeholder', '$ 0.00');

    await pickType(user, dialog, 'Percentage');
    expect(value).toHaveAttribute('placeholder', '0%');
  });

  it('keeps the value text on type change', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    const value = within(dialog).getByRole('textbox', { name: 'Value' });

    await pickCategory(user, dialog, '+ Add new category');
    await pickType(user, dialog, 'Fixed');
    await user.type(value, '50');
    await pickType(user, dialog, 'Percentage');

    expect(value).toHaveValue('50');
  });

  it('clears the value error on type change', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await pickCategory(user, dialog, '+ Add new category');
    await pickType(user, dialog, 'Fixed');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '0',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(
      within(dialog).getByText('Enter an amount above $ 0.00.'),
    ).toBeInTheDocument();

    await pickType(user, dialog, 'Percentage');

    expect(
      within(dialog).queryByText('Enter an amount above $ 0.00.'),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByText('Enter a percentage between 0 and 100.'),
    ).not.toBeInTheDocument();
  });

  it('re-validates under the new type on save', async () => {
    const user = userEvent.setup();
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Fun',
    );
    await pickCategory(user, dialog, '+ Add new category');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'New category' }),
      'Leisure',
    );
    await pickType(user, dialog, 'Fixed');
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '150',
    );
    await pickType(user, dialog, 'Percentage');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      within(dialog).getByText('Enter a percentage between 0 and 100.'),
    ).toBeInTheDocument();
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });

  it('takes the type from an existing category', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent, fun] });
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);
    const value = within(dialog).getByRole('textbox', { name: 'Value' });

    await pickCategory(user, dialog, 'Housing');
    expect(value).toHaveAttribute('placeholder', '$ 0.00');
    expect(
      within(dialog).queryByRole('combobox', { name: 'Type' }),
    ).not.toBeInTheDocument();

    await pickCategory(user, dialog, 'Leisure');
    expect(value).toHaveAttribute('placeholder', '0%');
  });

  it('takes the first budget type in a mixed category', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({
      budgets: [rent, { ...fun, id: 'mix-1', category: 'Housing' }],
    });
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await pickCategory(user, dialog, 'Housing');

    expect(
      within(dialog).getByRole('textbox', { name: 'Value' }),
    ).toHaveAttribute('placeholder', '$ 0.00');
  });

  it('shows New category as chosen with its name and type below', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await pickCategory(user, dialog, '+ Add new category');

    expect(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    ).toHaveTextContent('New category');
    const names = within(dialog)
      .getAllByRole('textbox')
      .map((field) => field.getAttribute('name'));
    expect(names).toEqual([
      'budget-name',
      'budget-new-category',
      'budget-value',
    ]);
    const newCategory = within(dialog).getByRole('textbox', {
      name: 'New category',
    });
    const type = within(dialog).getByRole('combobox', { name: 'Type' });
    expect(
      newCategory.compareDocumentPosition(type) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('drops the type when switching to a new category', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openAddDialog(user);

    await pickCategory(user, dialog, 'Housing');
    await pickCategory(user, dialog, '+ Add new category');

    expect(
      within(dialog).getByRole('combobox', { name: 'Type' }),
    ).not.toHaveTextContent('Fixed');
  });

  it('shows the name and type when editing into a new category', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openEditDialog(user, 'Rent');

    await pickCategory(user, dialog, '+ Add new category');

    expect(
      within(dialog).getByRole('textbox', { name: 'New category' }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('combobox', { name: 'Type' }),
    ).toBeInTheDocument();
  });

  async function openEditDialog(
    user: ReturnType<typeof userEvent.setup>,
    name: string,
  ) {
    await user.click(screen.getByRole('button', { name: `Edit ${name}` }));
    return screen.getByRole('dialog', { name: 'Edit budget' });
  }

  it('opens a seeded edit dialog', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');

    const dialog = await openEditDialog(user, 'Rent');

    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toHaveValue(
      'Rent',
    );
    expect(within(dialog).getByRole('textbox', { name: 'Value' })).toHaveValue(
      '$ 2,000.00',
    );
    expect(
      within(dialog).queryByRole('combobox', { name: 'Type' }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    ).toHaveTextContent('Housing');
  });

  it('saves an edit under the same id', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openEditDialog(user, 'Rent');

    const value = within(dialog).getByRole('textbox', { name: 'Value' });
    await user.clear(value);
    await user.type(value, '2500');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(useFinanceStore.getState().budgets).toEqual([
      { ...rent, value: 2500 },
    ]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Fixed · $2,500 / month')).toBeInTheDocument();
  });

  it('moves a budget to another category', async () => {
    const user = userEvent.setup();
    const utilities: Budget = { ...power, id: 'util-1', category: 'Utilities' };
    useFinanceStore.setState({ budgets: [rent, utilities] });
    await renderRoute('/budgets');
    const dialog = await openEditDialog(user, 'Rent');

    await pickCategory(user, dialog, 'Utilities');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      screen.queryByRole('region', { name: 'Housing' }),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Utilities' })).getByText(
        'Rent',
      ),
    ).toBeInTheDocument();
  });

  it('cancel leaves the budget unchanged', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openEditDialog(user, 'Rent');

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      ' Extra',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useFinanceStore.getState().budgets).toEqual([rent]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape leaves the budget unchanged', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openEditDialog(user, 'Rent');

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      ' Extra',
    );
    await user.keyboard('{Escape}');

    expect(useFinanceStore.getState().budgets).toEqual([rent]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  async function openDeleteDialog(
    user: ReturnType<typeof userEvent.setup>,
    name: string,
  ) {
    await user.click(screen.getByRole('button', { name: `Delete ${name}` }));
    return screen.getByRole('dialog', { name: `Delete ${name}?` });
  }

  it('opens the delete confirm', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');

    const dialog = await openDeleteDialog(user, 'Rent');

    expect(
      within(dialog).getByText("This can't be undone."),
    ).toBeInTheDocument();
    expect(
      within(dialog)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Cancel', 'Delete']);
  });

  it('cancel keeps the budget', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openDeleteDialog(user, 'Rent');

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useFinanceStore.getState().budgets).toEqual([rent]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape keeps the budget', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    await openDeleteDialog(user, 'Rent');

    await user.keyboard('{Escape}');

    expect(useFinanceStore.getState().budgets).toEqual([rent]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes the budget', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent, fun] });
    await renderRoute('/budgets');
    const dialog = await openDeleteDialog(user, 'Rent');

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(useFinanceStore.getState().budgets).toEqual([fun]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Housing' }),
    ).not.toBeInTheDocument();
  });

  it('shows the empty state after the last delete', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const dialog = await openDeleteDialog(user, 'Rent');

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(
      screen.getByText(
        'No budgets yet. Add your first one to split your salary.',
      ),
    ).toBeInTheDocument();
  });

  it('deletes from the edit dialog', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');
    const editDialog = await openEditDialog(user, 'Rent');

    await user.click(
      within(editDialog).getByRole('button', { name: 'Delete' }),
    );
    const confirm = screen.getByRole('dialog', { name: 'Delete Rent?' });
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    expect(useFinanceStore.getState().budgets).toEqual([]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the percentage alert on open', async () => {
    useFinanceStore.setState({
      budgets: [fun, { ...save, id: 'save-2', value: 50 }],
    });
    await renderRoute('/budgets');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Percentages sum to 110% — must be 100% or less.',
    );
  });

  it('shows the alert when an add pushes the sum above 100', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [fun] });
    await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Add budget' }));
    const dialog = screen.getByRole('dialog', { name: 'Add budget' });

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Name' }),
      'Savings',
    );
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Value' }),
      '50',
    );
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Category' }),
    );
    await user.click(screen.getByRole('option', { name: 'Leisure' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('110%');
  });

  it('shows no alert at 100', async () => {
    useFinanceStore.setState({
      budgets: [fun, { ...save, id: 'save-2', value: 40 }],
    });
    await renderRoute('/budgets');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('warns when fixed budgets exceed the salary', async () => {
    useFinanceStore.setState({ salary: 1500, budgets: [rent] });
    await renderRoute('/budgets');

    expect(screen.getByRole('status')).toHaveTextContent(
      'Fixed budgets exceed the salary by $500.',
    );
  });

  it('does not warn at or below the salary', async () => {
    useFinanceStore.setState({ salary: 2000, budgets: [rent] });
    await renderRoute('/budgets');

    expect(screen.queryByText(/Fixed budgets exceed/)).not.toBeInTheDocument();
  });

  it('does not warn when fixed equals the salary with float noise', async () => {
    useFinanceStore.setState({
      salary: 0.3,
      budgets: [
        { ...rent, value: 0.1 },
        { ...rent, id: 'rent-2', value: 0.2 },
      ],
    });
    await renderRoute('/budgets');

    expect(screen.queryByText(/Fixed budgets exceed/)).not.toBeInTheDocument();
  });

  it('See result goes to the result page', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [rent, fun] });
    const testRouter = await renderRoute('/budgets');

    await user.click(screen.getByRole('button', { name: 'See result' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/result');
    });
  });

  it('See result goes on when percentages sum to 100 with float noise', async () => {
    const user = userEvent.setup();
    const percent = (id: string, value: number): Budget => ({
      id,
      name: id,
      type: 'percentage',
      value,
      category: 'Plan',
    });
    useFinanceStore.setState({
      budgets: [percent('a', 0.01), percent('b', 70.68), percent('c', 29.31)],
    });
    const testRouter = await renderRoute('/budgets');

    await user.click(screen.getByRole('button', { name: 'See result' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/result');
    });
  });

  it('See result goes on despite the fixed warning', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ salary: 1500, budgets: [rent] });
    const testRouter = await renderRoute('/budgets');

    await user.click(screen.getByRole('button', { name: 'See result' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/result');
    });
  });

  it('See result stays when percentages exceed 100', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ budgets: [fun, trips] });
    const testRouter = await renderRoute('/budgets');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'See result' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Percentages sum to 110% — must be 100% or less.',
    );
    expect(testRouter.state.location.pathname).toBe('/budgets');
  });
});

describe('Budgets page in es', () => {
  beforeEach(async () => {
    await resetPersistence();
    await i18n.changeLanguage('es');
    useFinanceStore.setState({ salary: 5000 });
  });

  it('lists budgets in Spanish with euros', async () => {
    useFinanceStore.setState({ budgets: [rent, fun] });

    await renderRoute('/budgets');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tus presupuestos' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Fijo · 2000 € / mes')).toBeInTheDocument();
    expect(screen.getByText('Porcentaje · 60%')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Editar Rent' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eliminar Rent' }),
    ).toBeInTheDocument();
  });

  it('warns about fixed budgets over the salary in Spanish', async () => {
    useFinanceStore.setState({ budgets: [{ ...rent, value: 6000.5 }] });

    await renderRoute('/budgets');

    expect(
      screen.getByText(
        'Los presupuestos fijos superan el salario en 1000,50 €.',
      ),
    ).toBeInTheDocument();
  });

  it('adds a budget typed in the Spanish format', async () => {
    useFinanceStore.setState({ budgets: [rent] });
    await renderRoute('/budgets');

    await userEvent.click(
      screen.getByRole('button', { name: 'Añadir presupuesto' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Añadir presupuesto' });
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Nombre' }),
      'Luz',
    );
    await userEvent.click(
      within(dialog).getByRole('combobox', { name: 'Categoría' }),
    );
    await userEvent.click(screen.getByRole('option', { name: 'Housing' }));
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Valor' }),
      '89,90 €',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    );

    expect(useFinanceStore.getState().budgets[1]).toMatchObject({
      name: 'Luz',
      value: 89.9,
      category: 'Housing',
    });
  });
});
