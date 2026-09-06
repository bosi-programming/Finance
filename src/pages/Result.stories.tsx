import type { Meta, StoryObj } from '@storybook/react-vite';

import { Result } from './Result';

const meta = {
  title: 'Pages/Result',
  component: Result,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Result>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
