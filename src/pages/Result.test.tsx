import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/i18n';
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
const bigRent: Budget = { ...rent, value: 6000 };
const fullRent: Budget = { ...rent, value: 5000 };
const power: Budget = {
  id: 'power-1',
  name: 'Power',
  type: 'fixed',
  value: 89.9,
  category: 'Housing',
};
const travel: Budget = {
  id: 'travel-1',
  name: 'Travel',
  type: 'percentage',
  value: 60,
  category: 'Hobbies',
};
const halfTravel: Budget = { ...travel, value: 50 };
const savings: Budget = {
  id: 'savings-1',
  name: 'Savings',
  type: 'percentage',
  value: 30,
  category: 'Savings',
};
const restSavings: Budget = { ...savings, value: 40 };
const overSavings: Budget = { ...savings, value: 50 };

function jsonFile(value: unknown) {
  return new File([JSON.stringify(value)], 'plan.json', {
    type: 'application/json',
  });
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

function region(name: string) {
  return screen.getByRole('region', { name });
}

function budgetRow(name: string) {
  const row = screen
    .getAllByRole('listitem')
    .find(
      (item) =>
        within(item).queryByRole('heading', { level: 3, name }) !== null,
    );
  if (row === undefined) {
    throw new Error(`budget row ${name} not found`);
  }
  return row;
}

describe('Result page', () => {
  beforeEach(resetPersistence);

  describe('breakdown', () => {
    it('shows the salary', async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [rent, travel] });
      await renderRoute('/result');

      expect(within(region('Salary')).getByText('$5,000')).toBeInTheDocument();
    });

    it("shows each budget's allocated amount", async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [rent, travel] });
      await renderRoute('/result');

      expect(within(budgetRow('Rent')).getByText('$2,000')).toBeInTheDocument();
      expect(
        within(budgetRow('Travel')).getByText('$1,800'),
      ).toBeInTheDocument();
    });

    it("shows each budget's details", async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [rent, travel] });
      await renderRoute('/result');

      expect(
        within(budgetRow('Rent')).getByText('Fixed · $2,000 / month'),
      ).toBeInTheDocument();
      expect(
        within(budgetRow('Travel')).getByText('Percentage · 60%'),
      ).toBeInTheDocument();
    });

    it('shows each category total', async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [rent, power] });
      await renderRoute('/result');

      expect(
        within(region('Housing')).getByText('$2,089.90'),
      ).toBeInTheDocument();
    });
  });

  describe('Remaining', () => {
    it('shows a positive Remaining', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [rent, travel, savings],
      });
      await renderRoute('/result');

      expect(within(region('Remaining')).getByText('$300')).toBeInTheDocument();
    });

    it('shows Remaining of $0 at 100%', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [rent, travel, restSavings],
      });
      await renderRoute('/result');

      expect(within(region('Remaining')).getByText('$0')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows a negative Remaining', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [bigRent, halfTravel],
      });
      await renderRoute('/result');

      expect(
        within(region('Remaining')).getByText('-$500'),
      ).toBeInTheDocument();
    });
  });

  describe('percentage error', () => {
    it('shows the breakdown when percentages reach 100 with float noise', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [
          { ...travel, value: 0.01 },
          { ...savings, value: 70.68 },
          { ...rent, id: 'other-1', type: 'percentage', value: 29.31 },
        ],
      });
      await renderRoute('/result');

      expect(region('Remaining')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the error Toast above 100', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      await renderRoute('/result');

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Percentages sum to 110% — must be 100% or less.',
      );
    });

    it('shows the error Toast for an imported sum just above 100', async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [rent] });
      await renderRoute('/result');

      await userEvent.upload(
        screen.getByLabelText('Import file'),
        jsonFile({
          version: 'v0',
          salary: 5000,
          budgets: [halfTravel, { ...savings, value: 50.004 }],
        }),
      );

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Percentages sum to 100.004% — must be 100% or less.',
      );
    });

    it('hides the breakdown on error', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      await renderRoute('/result');

      await screen.findByRole('alert');
      expect(
        screen.queryByRole('region', { name: 'Hobbies' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: 'Savings' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: 'Remaining' }),
      ).not.toBeInTheDocument();
    });

    it('keeps Salary and the CTA on error', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      await renderRoute('/result');

      await screen.findByRole('alert');
      expect(within(region('Salary')).getByText('$5,000')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Edit budgets' }),
      ).toBeInTheDocument();
    });

    it('shows the Toast again when budgets change while above 100', async () => {
      const user = userEvent.setup();
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      await renderRoute('/result');
      await screen.findByRole('alert');
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      act(() => {
        useFinanceStore.setState({
          budgets: [travel, { ...savings, value: 60 }],
        });
      });

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Percentages sum to 120% — must be 100% or less.',
      );
    });

    it('closes the Toast when budgets change to 100 or less', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      await renderRoute('/result');
      await screen.findByRole('alert');

      act(() => {
        useFinanceStore.setState({ budgets: [travel] });
      });

      await screen.findByRole('region', { name: 'Remaining' });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('leaves another Toast open when budgets change to 100 or less', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      await renderRoute('/result');
      await screen.findByRole('alert');

      act(() => {
        useFinanceStore.setState({ toast: 'Another message' });
      });
      act(() => {
        useFinanceStore.setState({ budgets: [travel] });
      });

      await screen.findByRole('region', { name: 'Remaining' });
      expect(screen.getByRole('alert')).toHaveTextContent('Another message');
    });

    it('closes the Toast on leaving result with the sum above 100', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      const testRouter = await renderRoute('/result');
      await screen.findByRole('alert');

      await act(async () => {
        await testRouter.navigate({ to: '/salary' });
      });

      expect(testRouter.state.location.pathname).toBe('/salary');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps the Toast closed when nothing changes', async () => {
      const user = userEvent.setup();
      useFinanceStore.setState({
        salary: 5000,
        budgets: [travel, overSavings],
      });
      await renderRoute('/result');
      await screen.findByRole('alert');

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('fixed warning', () => {
    it('shows the warning when fixed exceeds salary', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [bigRent, halfTravel],
      });
      await renderRoute('/result');

      expect(screen.getByRole('status')).toHaveTextContent(
        'Fixed budgets exceed the salary by $1,000.',
      );
    });

    it('keeps the breakdown with negative amounts under the warning', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [bigRent, halfTravel],
      });
      await renderRoute('/result');

      expect(
        within(budgetRow('Travel')).getByText('-$500'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('status').compareDocumentPosition(region('Hobbies')) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('shows no warning when fixed equals salary', async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [fullRent] });
      await renderRoute('/result');

      expect(region('Remaining')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('error and warning', () => {
    it('shows Toast and Banner without a breakdown on error and warning', async () => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [bigRent, travel, overSavings],
      });
      await renderRoute('/result');

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Percentages sum to 110% — must be 100% or less.',
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        'Fixed budgets exceed the salary by $1,000.',
      );
      expect(
        screen.queryByRole('region', { name: 'Housing' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: 'Remaining' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('import and export', () => {
    it('offers Import and Export on result', async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [rent] });
      await renderRoute('/result');

      expect(screen.getByRole('button', { name: 'Import' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
    });

    it('Export on result downloads the current plan', async () => {
      const blobs: Blob[] = [];
      URL.createObjectURL = vi.fn((blob: Blob) => {
        blobs.push(blob);
        return 'blob:test';
      });
      URL.revokeObjectURL = vi.fn();
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
        return undefined;
      });
      useFinanceStore.setState({ salary: 5000, budgets: [rent, travel] });
      await renderRoute('/result');

      await userEvent.click(screen.getByRole('button', { name: 'Export' }));

      const text = await new Promise<unknown>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsText(blobs[0]);
      });
      expect(text).toBe(
        JSON.stringify(
          { version: 'v0', salary: 5000, budgets: [rent, travel] },
          null,
          2,
        ),
      );
    });

    it('Import on result replaces the breakdown', async () => {
      useFinanceStore.setState({ salary: 5000, budgets: [rent] });
      await renderRoute('/result');
      expect(region('Housing')).toBeInTheDocument();

      await userEvent.upload(
        screen.getByLabelText('Import file'),
        jsonFile({ version: 'v0', salary: 5000, budgets: [travel] }),
      );

      expect(
        await screen.findByRole('region', { name: 'Hobbies' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: 'Housing' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Edit budgets', () => {
    it.each([
      ['valid', [rent, travel]],
      ['warning', [bigRent, travel]],
      ['error', [travel, overSavings]],
    ])('Edit budgets goes to budgets: %s', async (_state, budgets) => {
      useFinanceStore.setState({ salary: 5000, budgets });
      const testRouter = await renderRoute('/result');

      await userEvent.click(
        screen.getByRole('button', { name: 'Edit budgets' }),
      );

      await waitFor(() => {
        expect(testRouter.state.location.pathname).toBe('/budgets');
      });
    });
  });

  describe('missing data', () => {
    it('shows the plan for a salary of 0', async () => {
      useFinanceStore.setState({ salary: 0, budgets: [rent] });
      await renderRoute('/result');

      expect(within(region('Salary')).getByText('$0')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Enter salary' }),
      ).not.toBeInTheDocument();
    });
  });
});

describe('Result page in pt-BR', () => {
  beforeEach(async () => {
    await resetPersistence();
    await i18n.changeLanguage('pt-BR');
  });

  it('shows the breakdown in Portuguese with reais', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [rent, travel] });

    await renderRoute('/result');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Resultado' }),
    ).toBeInTheDocument();
    expect(within(region('Salário')).getByText('R$ 5.000')).toBeVisible();
    expect(within(region('Restante')).getByText('R$ 1.200')).toBeVisible();
    expect(screen.getByText('Percentual · 60%')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Editar orçamentos' }),
    ).toBeInTheDocument();
  });
});
