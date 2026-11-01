import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { routeTree } from './router';
import { resetPersistence } from '@/test/resetPersistence';

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
