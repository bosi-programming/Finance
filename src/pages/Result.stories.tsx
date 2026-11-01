import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import { Result } from '@/pages/Result';
import { useFinanceStore } from '@/store';
import { type Budget } from '@/types/budget';

const RENT: Budget = {
  id: 'rent-1',
  name: 'Rent',
  type: 'fixed',
  value: 2000,
  category: 'Housing',
};

const percentageBudget = (
  name: string,
  value: number,
  category: string,
): Budget => ({
  id: `${name}-1`,
  name,
  type: 'percentage',
  value,
  category,
});

const withPlan =
  (salary: number | null, budgets: Budget[]): Decorator =>
  (Story) => {
    useFinanceStore.setState({ salary, budgets, toast: null });
    return <Story />;
  };

const meta = {
  title: 'Pages/Result',
  component: Result,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const rootRoute = createRootRoute();
      const resultRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Story,
      });
      const router = createRouter({
        routeTree: rootRoute.addChildren([resultRoute]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });
      return <RouterProvider router={router} />;
    },
  ],
} satisfies Meta<typeof Result>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    withPlan(5000, [
      RENT,
      percentageBudget('Travel', 60, 'Hobbies'),
      percentageBudget('Savings', 30, 'Savings'),
    ]),
  ],
};

export const ZeroRemaining: Story = {
  decorators: [
    withPlan(5000, [
      RENT,
      percentageBudget('Travel', 60, 'Hobbies'),
      percentageBudget('Savings', 40, 'Savings'),
    ]),
  ],
};

export const Warning: Story = {
  decorators: [
    withPlan(1000, [RENT, percentageBudget('Travel', 50, 'Hobbies')]),
  ],
};

export const ErrorState: Story = {
  decorators: [
    withPlan(5000, [
      RENT,
      percentageBudget('Travel', 60, 'Hobbies'),
      percentageBudget('Savings', 50, 'Savings'),
    ]),
  ],
};

export const ErrorAndWarning: Story = {
  decorators: [
    withPlan(1000, [
      RENT,
      percentageBudget('Travel', 60, 'Hobbies'),
      percentageBudget('Savings', 50, 'Savings'),
    ]),
  ],
};

export const NoSalary: Story = {
  decorators: [withPlan(null, [])],
};
