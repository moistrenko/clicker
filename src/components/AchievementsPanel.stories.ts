import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AchievementsPanel from '@/components/AchievementsPanel.vue'
import { ACHIEVEMENTS } from '@/game/catalog/achievements'

const allListings = ACHIEVEMENTS.map((achievement) => ({
  achievement,
  unlocked: false,
}))

const mixedListings = ACHIEVEMENTS.map((achievement, index) => ({
  achievement,
  unlocked: index < 6,
}))

const meta = {
  title: 'Game/AchievementsPanel',
  component: AchievementsPanel,
  tags: ['autodocs'],
  args: {
    listings: mixedListings,
  },
  decorators: [
    () => ({
      template:
        '<div style="width:320px;padding:1rem;background:#2a3428;border-radius:12px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof AchievementsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const MixedProgress: Story = {}

export const AllLocked: Story = {
  args: {
    listings: allListings,
  },
}

export const AllUnlocked: Story = {
  args: {
    listings: ACHIEVEMENTS.map((achievement) => ({
      achievement,
      unlocked: true,
    })),
  },
}
