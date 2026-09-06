import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Budgets } from './pages/Budgets';
import { Home } from './pages/Home';
import { Result } from './pages/Result';
import { Salary } from './pages/Salary';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <main className="dark:bg-background-on-dark bg-background-on-light flex min-h-screen w-screen flex-col items-center px-5 pt-5 md:pt-20 lg:justify-center lg:p-0">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  ),
});

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
