import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CookieCounter from '@/components/CookieCounter.vue'

const meta = {
  title: 'Game/CookieCounter',
  component: CookieCounter,
  tags: ['autodocs'],
  args: {
    cookies: '1,234',
    cps: '0.1',
  },
} satisfies Meta<typeof CookieCounter>

export default meta
type Story = StoryObj<typeof meta>

export const ModestBakery: Story = {}

export const Millions: Story = {
  args: {
    cookies: '1.235 million',
    cps: '12,400',
  },
}
