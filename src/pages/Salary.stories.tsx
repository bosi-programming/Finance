import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

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

export const Default: Story = {};
