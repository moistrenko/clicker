import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import SettingsPanel from '@/components/SettingsPanel.vue'

const meta = {
  title: 'Game/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
  args: {
    onExportSave: fn(),
    onImportSave: fn(),
    onWipeSave: fn(),
  },
  decorators: [
    () => ({
      template:
        '<div style="width:320px;padding:1rem;background:#2a3428;border-radius:12px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof SettingsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}

export const Expanded: Story = {
  decorators: [
    () => ({
      template:
        '<div style="width:320px;padding:1rem;background:#2a3428;border-radius:12px;"><details open><story /></details></div>',
    }),
  ],
}
