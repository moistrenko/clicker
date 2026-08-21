import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CookieCounter from '@/components/CookieCounter.vue'

const meta = {
  title: 'Game/CookieCounter',
  component: CookieCounter,
  tags: ['autodocs'],
  args: {
    coefficient: '1,234',
    scale: null,
    cps: '0.1',
  },
} satisfies Meta<typeof CookieCounter>

export default meta
type Story = StoryObj<typeof meta>

export const EarlyHorde: Story = {}

export const Millions: Story = {
  args: {
    coefficient: '1.235',
    scale: 'million',
    cps: '12,400',
  },
}
