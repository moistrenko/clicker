import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UpgradeTile from '@/components/UpgradeTile.vue'

const meta = {
  title: 'Game/UpgradeTile',
  component: UpgradeTile,
  tags: ['autodocs'],
  args: {
    name: 'Reinforced index finger',
    description: 'Clicks and cursors bake twice as many cookies.',
    price: 100,
    affordable: true,
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="max-width: 360px; padding: 16px; background: #2b1a0e;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof UpgradeTile>

export default meta
type Story = StoryObj<typeof meta>

export const Affordable: Story = {}

export const Unaffordable: Story = {
  args: {
    name: 'Ambidextrous',
    description: 'Clicks and cursors bake twice as many cookies.',
    price: 10_000,
    affordable: false,
  },
}
