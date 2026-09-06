import { useState } from 'react';
import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import {
  Button,
  Card,
  Input,
  Paper,
  Selector,
  Typography,
} from 'bosi-design-system/react';

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

const pageClasses = 'flex w-full max-w-md flex-col items-center gap-4 p-6';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Home() {
    return (
      <Paper className={pageClasses}>
        <Typography size="h1">Home</Typography>
        <Button color="primary">Primary action</Button>
      </Paper>
    );
  },
});

const salaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salary',
  component: function Salary() {
    const [salary, setSalary] = useState('');

    return (
      <Paper className={pageClasses}>
        <Typography size="h1">Salary</Typography>
        <Input
          name="salary"
          label="Salary"
          placeholder="Enter your salary"
          type="number"
          value={salary}
          setValue={setSalary}
        />
      </Paper>
    );
  },
});

const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  component: function Budgets() {
    const [budgetType, setBudgetType] = useState('');

    return (
      <Paper className={pageClasses}>
        <Typography size="h1">Budgets</Typography>
        <Selector
          name="budget-type"
          label="Budget type"
          placeholder="Select a budget type"
          value={budgetType}
          onChange={(event) => {
            setBudgetType(event.target.value);
          }}
          options={[
            { id: 'fixed', label: 'Fixed' },
            { id: 'percentage', label: 'Percentage' },
          ]}
        />
      </Paper>
    );
  },
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/result',
  component: function Result() {
    return (
      <Paper className={pageClasses}>
        <Typography size="h1">Result</Typography>
        <Card title="Result" content="Distribution preview" />
      </Paper>
    );
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  salaryRoute,
  budgetsRoute,
  resultRoute,
]);

export const router = createRouter({ routeTree });
