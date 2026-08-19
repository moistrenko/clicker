import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AscendPanel from '@/components/AscendPanel.vue'

const meta = {
  title: 'Game/AscendPanel',
  component: AscendPanel,
  tags: ['autodocs'],
  args: {
    rank: 3,
    multiplier: 1.03,
    projectedGain: 1,
    canAscend: true,
  },
  decorators: [
    () => ({
      template:
        '<div style="width:320px;padding:1rem;background:#2a3428;border-radius:12px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof AscendPanel>

export default meta
type Story = StoryObj<typeof meta>

export const ReadyToAscend: Story = {}

export const Locked: Story = {
  args: {
    rank: 1,
    multiplier: 1.01,
    projectedGain: 0,
    canAscend: false,
  },
}

export const HighRank: Story = {
  args: {
    rank: 12,
    multiplier: 1.12,
    projectedGain: 2,
    canAscend: true,
  },
}
