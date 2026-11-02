import type { Budget } from '@/types/budget';

export type GuardedPath = '/budgets' | '/result';
export type RedirectTarget = '/salary' | '/budgets';

export interface PlanPresence {
  salary: number | null;
  budgets: readonly Budget[];
}

export function routeRedirect(
  path: GuardedPath,
  plan: PlanPresence,
): RedirectTarget | null {
  if (plan.salary === null) {
    return '/salary';
  }
  if (path === '/result' && plan.budgets.length === 0) {
    return '/budgets';
  }
  return null;
}
