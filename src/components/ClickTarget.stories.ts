import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ClickTarget from '@/components/ClickTarget.vue'

const meta = {
  title: 'Game/ClickTarget',
  component: ClickTarget,
  tags: ['autodocs'],
  args: {
    gain: 1,
  },
} satisfies Meta<typeof ClickTarget>

export default meta
type Story = StoryObj<typeof meta>

export const Cookie: Story = {}

export const BiggerBite: Story = {
  args: {
    gain: 7,
  },
}
