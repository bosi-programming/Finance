import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from '@tanstack/react-router';
import { RootLayout } from '@/components/RootLayout';
import {
  routeRedirect,
  type GuardedPath,
} from '@/domain/routing/routeRedirect';
import { useFinanceStore } from '@/store';
import { Budgets } from './pages/Budgets';
import { Result } from './pages/Result';
import { Salary } from './pages/Salary';

const guard = (path: GuardedPath) => () => {
  const { salary, budgets } = useFinanceStore.getState();
  const target = routeRedirect(path, { salary, budgets });
  if (target !== null) {
    redirect({ to: target, replace: true, throw: true });
  }
};

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    redirect({ to: '/salary', replace: true, throw: true });
  },
});

const salaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salary',
  component: Salary,
});

const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  beforeLoad: guard('/budgets'),
  component: Budgets,
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  beforeLoad: guard('/result'),
  component: Result,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  salaryRoute,
  budgetsRoute,
  resultRoute,
]);

export const router = createRouter({ routeTree });
