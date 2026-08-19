import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UpgradeTile from '@/components/UpgradeTile.vue'

const meta = {
  title: 'Game/UpgradeTile',
  component: UpgradeTile,
  tags: ['autodocs'],
  args: {
    name: 'Reinforced grip',
    description: 'Manual strikes and baseball bats score twice as many kills.',
    price: 100,
    affordable: true,
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="max-width: 360px; padding: 16px; background: #1e241c;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof UpgradeTile>

export default meta
type Story = StoryObj<typeof meta>

export const Affordable: Story = {}

export const Unaffordable: Story = {
  args: {
    name: 'Dual wield bats',
    description: 'Manual strikes and baseball bats score twice as many kills.',
    price: 10_000,
    affordable: false,
  },
}
