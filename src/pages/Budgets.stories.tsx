import type { Meta, StoryObj } from '@storybook/react-vite';

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

export const Default: Story = {};
