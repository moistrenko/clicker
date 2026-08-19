import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UpgradeShelf from '@/components/UpgradeShelf.vue'
import type { UpgradeListing } from '@/game/types'

const sampleListings: UpgradeListing[] = [
  {
    upgrade: {
      id: 'cursor-1',
      name: 'Reinforced index finger',
      description: 'Clicks and cursors bake twice as many cookies.',
      buildingId: 'cursor',
      cost: 100,
      unlockOwned: 1,
      type: 'double',
      alsoBoostClick: true,
    },
    affordable: true,
  },
  {
    upgrade: {
      id: 'grandma-1',
      name: 'Forwards from Grandma',
      description: 'Doubles Grandma production of cookies.',
      buildingId: 'grandma',
      cost: 1000,
      unlockOwned: 1,
      type: 'double',
    },
    affordable: false,
  },
]

const meta = {
  title: 'Game/UpgradeShelf',
  component: UpgradeShelf,
  tags: ['autodocs'],
  args: {
    listings: sampleListings,
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="max-width: 360px; padding: 16px; background: #2b1a0e;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof UpgradeShelf>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {}

export const PurchasedHidden: Story = {
  args: {
    listings: [],
  },
}
