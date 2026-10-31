import {
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router';
import { RootLayout } from '@/components/RootLayout';
import { Budgets } from './pages/Budgets';
import { Home } from './pages/Home';
import { Result } from './pages/Result';
import { Salary } from './pages/Salary';

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const salaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salary',
  component: Salary,
});

const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  component: Budgets,
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  component: Result,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  salaryRoute,
  budgetsRoute,
  resultRoute,
]);

export const router = createRouter({ routeTree });
