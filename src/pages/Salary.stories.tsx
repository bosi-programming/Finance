import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import '@/i18n';
import { useFinanceStore } from '@/store';
import { Salary } from './Salary';

const meta = {
  title: 'Pages/Salary',
  component: Salary,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const rootRoute = createRootRoute();
      const salaryRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Story,
      });
      const router = createRouter({
        routeTree: rootRoute.addChildren([salaryRoute]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });
      return <RouterProvider router={router} />;
    },
  ],
} satisfies Meta<typeof Salary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => {
      useFinanceStore.setState({ salary: null, budgets: [] });
      return <Story />;
    },
  ],
};

export const SalarySaved: Story = {
  decorators: [
    (Story) => {
      useFinanceStore.setState({ salary: 5000, budgets: [] });
      return <Story />;
    },
  ],
};

export const SalaryWithBudgets: Story = {
  decorators: [
    (Story) => {
      useFinanceStore.setState({
        salary: 5000,
        budgets: [
          {
            id: 'rent-1',
            name: 'Rent',
            type: 'fixed',
            value: 2000,
            category: 'Housing',
          },
        ],
      });
      return <Story />;
    },
  ],
};
