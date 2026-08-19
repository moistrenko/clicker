import type { Meta, StoryObj } from '@storybook/vue3-vite'
import OfflineBanner from '@/components/OfflineBanner.vue'

const meta = {
  title: 'Game/OfflineBanner',
  component: OfflineBanner,
  tags: ['autodocs'],
  args: {
    kills: 12_345,
  },
  decorators: [
    () => ({
      template: '<div style="min-height:120px;background:#2a3428;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof OfflineBanner>

export default meta
type Story = StoryObj<typeof meta>

export const AwayProgress: Story = {}

export const SmallGain: Story = {
  args: {
    kills: 42,
  },
}

export const LargeGain: Story = {
  args: {
    kills: 5_600_000,
  },
}

export const Hidden: Story = {
  args: {
    kills: 0,
  },
}
