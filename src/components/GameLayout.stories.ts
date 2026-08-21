import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BuildingRow from '@/components/BuildingRow.vue'
import ClickTarget from '@/components/ClickTarget.vue'
import CookieCounter from '@/components/CookieCounter.vue'
import GameLayout from '@/components/GameLayout.vue'
import NewsTicker from '@/components/NewsTicker.vue'
import StatsPanel from '@/components/StatsPanel.vue'

const meta = {
  title: 'Game/GameLayout',
  component: GameLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GameLayout>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeColumns: Story = {
  render: () => ({
    components: { GameLayout, CookieCounter, ClickTarget, StatsPanel, NewsTicker, BuildingRow },
    template: `
      <GameLayout>
        <template #bakery>
          <CookieCounter coefficient="128" cps="1.1" />
          <ClickTarget :gain="1" />
        </template>
        <template #center>
          <StatsPanel baked="128" :buildings-owned="2" />
          <NewsTicker />
        </template>
        <template #store>
          <div style="display: grid; gap: 8px;">
            <BuildingRow name="Cursor" :owned="1" :price="18" :affordable="true" />
            <BuildingRow name="Grandma" :owned="1" :price="100" :affordable="true" />
            <BuildingRow name="Farm" :owned="0" :price="1100" :affordable="false" />
            <BuildingRow name="Mine" :owned="0" :price="12000" :affordable="false" :locked="true" />
          </div>
        </template>
      </GameLayout>
    `,
  }),
}
