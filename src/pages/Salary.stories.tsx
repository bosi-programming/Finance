import type { Meta, StoryObj } from '@storybook/react-vite';

import { Salary } from './Salary';

const meta = {
  title: 'Pages/Salary',
  component: Salary,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Salary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
