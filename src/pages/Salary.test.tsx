import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/i18n';
import { db } from '@/persistence/db';
import { routeTree } from '@/router';
import { storageFailedMessage, useFinanceStore } from '@/store';
import { resetPersistence } from '@/test/resetPersistence';

const rent = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed' as const,
  value: 2000,
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

function field() {
  return screen.getByRole('textbox', { name: 'Gross salary' });
}

describe('Salary page', () => {
  beforeEach(resetPersistence);

  it('shows the no-salary copy and an empty field', async () => {
    await renderRoute('/salary');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "What's your gross salary?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your starting point. Next, you'll split it into budgets.",
      ),
    ).toBeInTheDocument();
    expect(field()).toHaveValue('');
    expect(screen.getByPlaceholderText('$ 0.00')).toBe(field());
  });

  it('offers Continue and Import JSON without a salary', async () => {
    await renderRoute('/salary');

    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Import JSON' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'See result' }),
    ).not.toBeInTheDocument();
  });

  it('opens the JSON file picker from Import JSON', async () => {
    const opened: (string | null)[] = [];
    const spy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function click(this: HTMLInputElement) {
        opened.push(this.getAttribute('aria-label'));
      });
    await renderRoute('/salary');

    await userEvent.click(screen.getByRole('button', { name: 'Import JSON' }));

    expect(opened).toEqual(['Import JSON file']);
    spy.mockRestore();
  });

  it('shows the saved-salary copy', async () => {
    useFinanceStore.setState({ salary: 5000 });
    await renderRoute('/salary');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your gross salary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Update it anytime — budgets recalculate instantly.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Import JSON' }),
    ).not.toBeInTheDocument();
  });

  it('shows the stored salary formatted', async () => {
    useFinanceStore.setState({ salary: 5000 });
    await renderRoute('/salary');

    expect(field()).toHaveValue('$ 5,000.00');
  });

  it('shows a stored zero as $ 0.00', async () => {
    useFinanceStore.setState({ salary: 0 });
    await renderRoute('/salary');

    expect(field()).toHaveValue('$ 0.00');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Your gross salary' }),
    ).toBeInTheDocument();
  });

  it('formats a valid entry on blur', async () => {
    await renderRoute('/salary');

    await userEvent.type(field(), '5000.5');
    await userEvent.tab();

    expect(field()).toHaveValue('$ 5,000.50');
  });

  it('keeps an invalid entry as typed on blur', async () => {
    await renderRoute('/salary');

    await userEvent.type(field(), 'abc');
    await userEvent.tab();

    expect(field()).toHaveValue('abc');
    expect(
      screen.queryByText('Enter an amount of $ 0.00 or more.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Enter your gross salary.'),
    ).not.toBeInTheDocument();
  });

  it('saves the salary and goes to budgets', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.type(field(), '5,000');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(useFinanceStore.getState().salary).toBe(5000);
    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
  });

  it('updates a saved salary and goes to budgets', async () => {
    useFinanceStore.setState({ salary: 3000 });
    const testRouter = await renderRoute('/salary');

    await userEvent.clear(field());
    await userEvent.type(field(), '4000');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(useFinanceStore.getState().salary).toBe(4000);
    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
  });

  it('asks for a salary when the field is empty', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Enter your gross salary.')).toBeInTheDocument();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(useFinanceStore.getState().salary).toBeNull();
    expect(testRouter.state.location.pathname).toBe('/salary');
  });

  it('rejects a negative amount', async () => {
    useFinanceStore.setState({ salary: 3000 });
    const testRouter = await renderRoute('/salary');

    await userEvent.clear(field());
    await userEvent.type(field(), '-1');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      screen.getByText('Enter an amount of $ 0.00 or more.'),
    ).toBeInTheDocument();
    expect(useFinanceStore.getState().salary).toBe(3000);
    expect(testRouter.state.location.pathname).toBe('/salary');
  });

  it('clears the error on the next edit', async () => {
    await renderRoute('/salary');

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Enter your gross salary.')).toBeInTheDocument();
    await userEvent.type(field(), '1');

    expect(
      screen.queryByText('Enter your gross salary.'),
    ).not.toBeInTheDocument();
  });

  it('shows See result with a salary and budgets', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [rent] });
    const testRouter = await renderRoute('/salary');

    await userEvent.click(screen.getByRole('button', { name: 'See result' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/result');
    });
  });

  it('hides See result with a salary and no budgets', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [] });
    await renderRoute('/salary');

    expect(
      screen.queryByRole('button', { name: 'See result' }),
    ).not.toBeInTheDocument();
  });

  it('hides Add budgets with a salary and budgets', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [rent] });
    await renderRoute('/salary');

    expect(
      screen.queryByRole('button', { name: 'Add budgets' }),
    ).not.toBeInTheDocument();
  });

  it('Add budgets goes to budgets with a salary and no budgets', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [] });
    const testRouter = await renderRoute('/salary');

    await userEvent.click(screen.getByRole('button', { name: 'Add budgets' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
  });

  it('shows Add budgets at salary 0 with no budgets', async () => {
    useFinanceStore.setState({ salary: 0, budgets: [] });
    await renderRoute('/salary');

    expect(
      screen.getByRole('button', { name: 'Add budgets' }),
    ).toBeInTheDocument();
  });

  it('hides Add budgets with no salary', async () => {
    await renderRoute('/salary');

    expect(
      screen.queryByRole('button', { name: 'Add budgets' }),
    ).not.toBeInTheDocument();
  });

  it('still goes to budgets when saving fails', async () => {
    vi.spyOn(db.appState, 'put').mockRejectedValue(new Error('quota'));
    const testRouter = await renderRoute('/salary');

    await userEvent.type(field(), '5000');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      storageFailedMessage(),
    );
  });

  it('does not submit on Enter', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.type(field(), '5000{Enter}');

    expect(useFinanceStore.getState().salary).toBeNull();
    expect(testRouter.state.location.pathname).toBe('/salary');
  });
});

describe('Salary page in pt-BR', () => {
  beforeEach(async () => {
    await resetPersistence();
    await i18n.changeLanguage('pt-BR');
  });

  it('shows the copy and saves a pt-BR amount', async () => {
    const testRouter = await renderRoute('/salary');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Qual é o seu salário bruto?',
      }),
    ).toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Salário bruto' });
    expect(screen.getByPlaceholderText('R$ 0,00')).toBe(input);

    await userEvent.type(input, '5.000,50');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(useFinanceStore.getState().salary).toBe(5000.5);
    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
  });

  it('shows the error with the local amount', async () => {
    await renderRoute('/salary');

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Salário bruto' }),
      '5,000.50',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      screen.getByText('Informe um valor de R$ 0,00 ou mais.'),
    ).toBeInTheDocument();
  });

  it('shows a saved salary in the local format', async () => {
    useFinanceStore.setState({ salary: 1234.5 });

    await renderRoute('/salary');

    expect(screen.getByRole('textbox', { name: 'Salário bruto' })).toHaveValue(
      'R$ 1.234,50',
    );
  });
});
