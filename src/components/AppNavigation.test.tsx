import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/i18n';
import { db } from '@/persistence/db';
import { routeTree } from '@/router';
import {
  importFailedMessage,
  storageFailedMessage,
  useFinanceStore,
} from '@/store';
import { resetPersistence } from '@/test/resetPersistence';

const rent = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed' as const,
  value: 2000,
  category: 'Housing',
};

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

describe('navigation', () => {
  beforeEach(resetPersistence);

  it.each(['/', '/salary', '/budgets', '/result'])(
    'shows nav on %s',
    async (path) => {
      await renderRoute(path);

      expect(screen.getByRole('link', { name: 'Salary' })).toHaveAttribute(
        'href',
        '/salary',
      );
      expect(screen.getByRole('link', { name: 'Budgets' })).toHaveAttribute(
        'href',
        '/budgets',
      );
      expect(screen.getByRole('link', { name: 'Result' })).toHaveAttribute(
        'href',
        '/result',
      );
      expect(screen.getByRole('button', { name: 'Import' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Export' })).toBeVisible();
    },
  );

  it('puts the route links before the Import and Export actions', async () => {
    await renderRoute('/salary');

    const links = screen.getByRole('link', { name: 'Result' }).parentElement;
    const actions = screen.getByRole('button', {
      name: 'Import',
    }).parentElement;
    if (links === null || actions === null) {
      throw new Error('navigation groups not found');
    }

    expect(links).not.toBe(actions);
    expect(links).toContainElement(
      screen.getByRole('link', { name: 'Salary' }),
    );
    expect(actions).toContainElement(
      screen.getByRole('button', { name: 'Export' }),
    );
    expect(
      links.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('marks only the active route', async () => {
    useFinanceStore.setState({ salary: 5000 });
    await renderRoute('/budgets');

    expect(screen.getByRole('link', { name: 'Budgets' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Salary' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('link', { name: 'Result' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navigates when a link is clicked', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [rent] });
    const testRouter = await renderRoute('/salary');

    await userEvent.click(screen.getByRole('link', { name: 'Result' }));

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/result');
    });
  });

  it('keeps the click from reloading the page', async () => {
    await renderRoute('/salary');

    const notPrevented = fireEvent.click(
      screen.getByRole('link', { name: 'Result' }),
    );

    expect(notPrevented).toBe(false);
  });

  it('moves focus to main after navigating', async () => {
    useFinanceStore.setState({ salary: 5000, budgets: [rent] });
    await renderRoute('/salary');

    await userEvent.click(screen.getByRole('link', { name: 'Result' }));

    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveFocus();
    });
  });

  it('does not move focus on first render', async () => {
    await renderRoute('/salary');

    expect(screen.getByRole('main')).not.toHaveFocus();
  });
});

describe('export', () => {
  beforeEach(resetPersistence);

  it('disables Export with no salary', async () => {
    await renderRoute('/salary');

    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
  });

  it('enables Export at salary 0', async () => {
    useFinanceStore.setState({ salary: 0 });

    await renderRoute('/salary');

    expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
  });

  it('downloads the file named finance-fe-v0.json', async () => {
    const names: string[] = [];
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click(this: HTMLAnchorElement) {
        names.push(this.download);
      },
    );
    useFinanceStore.setState({ salary: 5000, budgets: [rent] });
    await renderRoute('/salary');

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(names).toEqual(['finance-fe-v0.json']);
  });

  it('downloads the current salary and budgets', async () => {
    const blobs: Blob[] = [];
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return 'blob:test';
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      return undefined;
    });
    useFinanceStore.setState({ salary: 5000, budgets: [rent] });
    await renderRoute('/salary');

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    const text = await new Promise<unknown>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsText(blobs[0]);
    });
    expect(text).toBe(
      JSON.stringify({ version: 'v0', salary: 5000, budgets: [rent] }, null, 2),
    );
  });
});

describe('Import JSON on salary', () => {
  beforeEach(resetPersistence);

  it('shows Import JSON with no salary', async () => {
    await renderRoute('/salary');

    expect(screen.getByRole('button', { name: 'Import JSON' })).toBeVisible();
    expect(screen.getByLabelText('Import JSON file')).toBeInTheDocument();
  });

  it('keeps the native file inputs hidden', async () => {
    await renderRoute('/salary');

    expect(screen.getByLabelText('Import file')).toHaveAttribute('hidden');
    expect(screen.getByLabelText('Import JSON file')).toHaveAttribute('hidden');
  });

  it('hides Import JSON with a salary', async () => {
    useFinanceStore.setState({ salary: 3000 });

    await renderRoute('/salary');

    expect(
      screen.queryByRole('button', { name: 'Import JSON' }),
    ).not.toBeInTheDocument();
  });

  it('hides Import JSON at salary 0', async () => {
    useFinanceStore.setState({ salary: 0 });

    await renderRoute('/salary');

    expect(
      screen.queryByRole('button', { name: 'Import JSON' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Import JSON file')).not.toBeInTheDocument();
  });
});

describe('import', () => {
  beforeEach(resetPersistence);

  const withBudgets = { version: 'v0', salary: 5000, budgets: [rent] };
  const empty = { version: 'v0', salary: 5000, budgets: [] };

  it('replaces memory', async () => {
    useFinanceStore.setState({ salary: 1, budgets: [{ ...rent, id: 'old' }] });
    await renderRoute('/budgets');

    await userEvent.upload(
      screen.getByLabelText('Import file'),
      jsonFile(withBudgets),
    );

    await waitFor(() => {
      expect(useFinanceStore.getState().budgets).toEqual([rent]);
    });
    expect(useFinanceStore.getState().salary).toBe(5000);
  });

  it('replaces the row', async () => {
    await renderRoute('/budgets');

    await userEvent.upload(
      screen.getByLabelText('Import file'),
      jsonFile(withBudgets),
    );

    await waitFor(async () => {
      expect(await db.appState.get('current')).toEqual(withBudgets);
    });
  });

  it('redirects to result with budgets', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.upload(
      screen.getByLabelText('Import file'),
      jsonFile(withBudgets),
    );

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/result');
    });
  });

  it('redirects to budgets when empty', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.upload(
      screen.getByLabelText('Import file'),
      jsonFile(empty),
    );

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/budgets');
    });
  });

  it('imports from the salary page control', async () => {
    const testRouter = await renderRoute('/salary');

    await userEvent.upload(
      screen.getByLabelText('Import JSON file'),
      jsonFile(withBudgets),
    );

    await waitFor(() => {
      expect(testRouter.state.location.pathname).toBe('/result');
    });
  });

  it('shows the failure toast and changes nothing for an invalid file', async () => {
    useFinanceStore.setState({ salary: 1 });
    const testRouter = await renderRoute('/budgets');

    await userEvent.upload(
      screen.getByLabelText('Import file'),
      new File(['not json'], 'plan.json', { type: 'application/json' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      importFailedMessage(),
    );
    expect(useFinanceStore.getState().salary).toBe(1);
    expect(testRouter.state.location.pathname).toBe('/budgets');
    expect(await db.appState.get('current')).toBeUndefined();
  });

  it('shows the failure toast and changes nothing when the file cannot be read', async () => {
    useFinanceStore.setState({ salary: 1 });
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(
      function readAsText(this: FileReader) {
        this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
      },
    );
    const testRouter = await renderRoute('/budgets');

    await userEvent.upload(
      screen.getByLabelText('Import file'),
      jsonFile(withBudgets),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      importFailedMessage(),
    );
    expect(useFinanceStore.getState().salary).toBe(1);
    expect(testRouter.state.location.pathname).toBe('/budgets');
    expect(await db.appState.get('current')).toBeUndefined();
  });

  it('keeps memory, shows the toast and stays when the write fails', async () => {
    useFinanceStore.setState({ salary: 1 });
    vi.spyOn(db.appState, 'put').mockRejectedValue(new Error('write failed'));
    const testRouter = await renderRoute('/budgets');

    await userEvent.upload(
      screen.getByLabelText('Import file'),
      jsonFile(withBudgets),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      importFailedMessage(),
    );
    expect(useFinanceStore.getState().salary).toBe(1);
    expect(testRouter.state.location.pathname).toBe('/budgets');
  });

  it('imports the same file twice', async () => {
    const put = vi.spyOn(db.appState, 'put');
    await renderRoute('/budgets');
    const input = screen.getByLabelText('Import file');
    const file = jsonFile(empty);

    await userEvent.upload(input, file);
    await waitFor(() => {
      expect(put).toHaveBeenCalledTimes(1);
    });
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(put).toHaveBeenCalledTimes(2);
    });
  });

  it('ignores a cancelled dialog', async () => {
    const put = vi.spyOn(db.appState, 'put');
    await renderRoute('/budgets');

    fireEvent.change(screen.getByLabelText('Import file'), {
      target: { files: [] },
    });

    expect(put).not.toHaveBeenCalled();
    expect(useFinanceStore.getState().toast).toBeNull();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('toast', () => {
  beforeEach(resetPersistence);

  it('shows the toast message in an alert', async () => {
    useFinanceStore.setState({ toast: storageFailedMessage() });

    await renderRoute('/budgets');

    expect(screen.getByRole('alert')).toHaveTextContent(storageFailedMessage());
  });

  it('clears the toast from its close button', async () => {
    useFinanceStore.setState({ toast: storageFailedMessage() });
    await renderRoute('/budgets');

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(useFinanceStore.getState().toast).toBeNull();
  });
});

describe('navigation in pt-BR', () => {
  beforeEach(async () => {
    await resetPersistence();
    await i18n.changeLanguage('pt-BR');
  });

  it('labels links, actions and the toast in Portuguese', async () => {
    useFinanceStore.setState({ toast: storageFailedMessage() });

    await renderRoute('/salary');

    expect(screen.getByRole('link', { name: 'Salário' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Orçamentos' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Resultado' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Importar' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeVisible();
    expect(screen.getByLabelText('Importar arquivo')).toHaveAttribute('hidden');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível salvar seus dados neste navegador.',
    );
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeVisible();
  });
});
