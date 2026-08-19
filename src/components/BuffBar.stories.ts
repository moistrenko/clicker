import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BuffBar from '@/components/BuffBar.vue'

const meta = {
  title: 'Game/BuffBar',
  component: BuffBar,
  tags: ['autodocs'],
  args: {
    buffs: [],
  },
  decorators: [
    () => ({
      template:
        '<div style="width:320px;padding:1rem;background:#f3e2c2;border-radius:12px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BuffBar>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const SingleBuff: Story = {
  args: {
    buffs: [
      {
        id: 'buff-1',
        name: 'Frenzy',
        description: 'Cookie production ×7',
        remainingSeconds: 64.2,
      },
    ],
  },
}

export const MultipleBuffs: Story = {
  args: {
    buffs: [
      {
        id: 'buff-1',
        name: 'Frenzy',
        description: 'Cookie production ×7',
        remainingSeconds: 42.5,
      },
      {
        id: 'buff-2',
        name: 'Click frenzy',
        description: 'Cookie clicks ×777',
        remainingSeconds: 9.8,
      },
      {
        id: 'buff-3',
        name: 'Building special',
        description: 'Grandma production ×7',
        remainingSeconds: 71,
      },
    ],
  },
}
