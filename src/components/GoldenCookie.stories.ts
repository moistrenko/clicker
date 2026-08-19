import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GoldenCookie from '@/components/GoldenCookie.vue'

const meta = {
  title: 'Game/GoldenCookie',
  component: GoldenCookie,
  tags: ['autodocs'],
  args: {
    x: 0.22,
    y: 0.28,
  },
  decorators: [
    () => ({
      template:
        '<div style="position:relative;width:320px;height:320px;background:linear-gradient(180deg,#f6dcb0,#e8b56d);border-radius:12px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof GoldenCookie>

export default meta
type Story = StoryObj<typeof meta>

export const TopLeft: Story = {}

export const BottomRight: Story = {
  args: {
    x: 0.78,
    y: 0.74,
  },
}

export const UpperEdge: Story = {
  args: {
    x: 0.52,
    y: 0.12,
  },
}
