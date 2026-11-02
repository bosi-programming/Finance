import { describe, expect, it } from 'vitest';

import type { Budget } from '@/types/budget';
import { routeRedirect } from './routeRedirect';

const rent: Budget = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
};

describe('routeRedirect', () => {
  it('sends budgets to salary with no salary', () => {
    expect(routeRedirect('/budgets', { salary: null, budgets: [] })).toBe(
      '/salary',
    );
  });

  it('lets budgets through at salary 0', () => {
    expect(routeRedirect('/budgets', { salary: 0, budgets: [] })).toBeNull();
  });

  it('sends result to salary with no salary', () => {
    expect(routeRedirect('/result', { salary: null, budgets: [rent] })).toBe(
      '/salary',
    );
  });

  it('checks salary before budgets', () => {
    expect(routeRedirect('/result', { salary: null, budgets: [] })).toBe(
      '/salary',
    );
  });

  it('sends result to budgets with no budgets', () => {
    expect(routeRedirect('/result', { salary: 5000, budgets: [] })).toBe(
      '/budgets',
    );
  });

  it('sends result to budgets at salary 0 with no budgets', () => {
    expect(routeRedirect('/result', { salary: 0, budgets: [] })).toBe(
      '/budgets',
    );
  });

  it('lets result through with salary and budgets', () => {
    expect(
      routeRedirect('/result', { salary: 5000, budgets: [rent] }),
    ).toBeNull();
  });
});
