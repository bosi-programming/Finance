import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { routeTree } from './router';

async function renderRoute(path: string) {
  const testRouter = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await testRouter.load();

  render(<RouterProvider router={testRouter} />);
}

describe('router', () => {
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
      screen.getByRole('heading', { level: 1, name: 'Salary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: 'Salary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your salary'),
    ).toBeInTheDocument();
  });

  it('renders the Budgets route with a Selector and its options', async () => {
    await renderRoute('/budgets');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Budgets' }),
    ).toBeInTheDocument();
    const selector = screen.getByRole('combobox', { name: 'Budget type' });
    await userEvent.click(selector);
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: 'Fixed' }),
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole('option', { name: 'Percentage' }),
    ).toBeInTheDocument();
  });

  it('renders the Result route with a Card', async () => {
    await renderRoute('/result');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Result' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Result' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Distribution preview')).toBeInTheDocument();
  });

  it.each(['/', '/salary', '/budgets', '/result'])(
    'replaces the placeholder on %s',
    async (path) => {
      await renderRoute(path);

      expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
    },
  );
});
