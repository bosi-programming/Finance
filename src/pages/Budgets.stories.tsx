import type { Meta, StoryObj } from '@storybook/react-vite';

import { useFinanceStore } from '@/store';
import { Budgets } from './Budgets';

const meta = {
  title: 'Pages/Budgets',
  component: Budgets,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Budgets>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => {
      useFinanceStore.setState({ budgets: [] });
      return <Story />;
    },
  ],
};

export const WithBudgets: Story = {
  decorators: [
    (Story) => {
      useFinanceStore.setState({
        budgets: [
          {
            id: 'rent-1',
            name: 'Rent',
            type: 'fixed',
            value: 2000,
            category: 'Housing',
          },
          {
            id: 'power-1',
            name: 'Power',
            type: 'fixed',
            value: 89.9,
            category: 'Housing',
          },
          {
            id: 'fun-1',
            name: 'Fun',
            type: 'percentage',
            value: 60,
            category: 'Leisure',
          },
        ],
      });
      return <Story />;
    },
  ],
};
