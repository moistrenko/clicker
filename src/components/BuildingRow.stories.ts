import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BuildingRow from '@/components/BuildingRow.vue'

const meta = {
  title: 'Game/BuildingRow',
  component: BuildingRow,
  tags: ['autodocs'],
  args: {
    name: 'Cursor',
    owned: 3,
    price: 23,
    affordable: true,
    locked: false,
    cpsEach: 0.1,
    cpsTotal: 0.3,
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="max-width: 360px; padding: 16px; background: #2b1a0e;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BuildingRow>

export default meta
type Story = StoryObj<typeof meta>

export const Affordable: Story = {}

export const Unaffordable: Story = {
  args: {
    name: 'Grandma',
    owned: 0,
    price: 100,
    affordable: false,
  },
}

export const Locked: Story = {
  args: {
    name: 'Portal',
    owned: 0,
    price: 1_000_000_000_000,
    affordable: false,
    locked: true,
  },
}
