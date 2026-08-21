import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UpgradeShelf from '@/components/UpgradeShelf.vue'
import type { UpgradeListing } from '@/game/types'

const sampleListings: UpgradeListing[] = [
  {
    upgrade: {
      id: 'cursor-1',
      name: 'Reinforced grip',
      description: 'Manual strikes and baseball bats score twice as many kills.',
      buildingId: 'cursor',
      cost: 100,
      unlockOwned: 1,
      type: 'double',
      alsoBoostClick: true,
    },
    affordable: true,
    cpsGain: 0.1,
    clickGain: 1,
  },
  {
    upgrade: {
      id: 'grandma-1',
      name: 'Buckshot spread',
      description: 'Doubles Shotgun Granny kill rate.',
      buildingId: 'grandma',
      cost: 1000,
      unlockOwned: 1,
      type: 'double',
    },
    affordable: false,
    cpsGain: 5,
    clickGain: 0,
  },
]

const meta = {
  title: 'Game/UpgradeShelf',
  component: UpgradeShelf,
  tags: ['autodocs'],
  args: {
    listings: sampleListings,
    nameFor: (listing: UpgradeListing) => listing.upgrade.name,
    descriptionFor: (listing: UpgradeListing) => listing.upgrade.description,
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div style="max-width: 360px; padding: 16px; background: #1e241c;"><story /></div>',
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
