import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AchievementToast from '@/components/AchievementToast.vue'

const meta = {
  title: 'Game/AchievementToast',
  component: AchievementToast,
  tags: ['autodocs'],
  args: {
    achievement: null,
  },
  decorators: [
    () => ({
      template: '<div style="min-height:160px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof AchievementToast>

export default meta
type Story = StoryObj<typeof meta>

export const Hidden: Story = {
  args: {
    achievement: null,
  },
}

export const Unlocked: Story = {
  args: {
    achievement: {
      id: 'first-blood',
      name: 'First Blood',
      description: 'Score your first kill.',
      icon: '🩸',
      condition: { type: 'totalKills', threshold: 1 },
    },
  },
}

export const MidGameUnlock: Story = {
  args: {
    achievement: {
      id: 'killing-machine',
      name: 'Killing Machine',
      description: 'Reach 100 kills per second.',
      icon: '⚡',
      condition: { type: 'cps', threshold: 100 },
    },
  },
}
