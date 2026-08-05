import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

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
  component: function Index() {
    return (
      <div className="p-2">
        <h3>Welcome Home!</h3>
      </div>
    );
  },
});

const salaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salary',
  component: function Index() {
    return (
      <div className="p-2">
        <h3>Welcome Salary!</h3>
      </div>
    );
  },
});

const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  component: function Index() {
    return (
      <div className="p-2">
        <h3>Welcome budgets!</h3>
      </div>
    );
  },
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  component: function Index() {
    return (
      <div className="p-2">
        <h3>Welcome Result!</h3>
      </div>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  salaryRoute,
  budgetsRoute,
  resultRoute,
]);

export const router = createRouter({ routeTree });
