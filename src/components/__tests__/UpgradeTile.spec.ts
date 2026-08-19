import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UpgradeTile from '@/components/UpgradeTile.vue'
import { i18n } from '@/i18n'

describe('UpgradeTile', () => {
  it('is enabled when affordable', () => {
    const wrapper = mount(UpgradeTile, {
      global: { plugins: [i18n] },
      props: {
        name: 'Reinforced grip',
        description: 'Manual strikes and baseball bats score twice as many kills.',
        price: 100,
        affordable: true,
      },
    })
    expect(wrapper.get('button').element.disabled).toBe(false)
    expect(wrapper.text()).toContain('100')
  })

  it('is disabled when unaffordable', () => {
    const wrapper = mount(UpgradeTile, {
      global: { plugins: [i18n] },
      props: {
        name: 'Reinforced grip',
        description: 'Manual strikes and baseball bats score twice as many kills.',
        price: 100,
        affordable: false,
      },
    })
    expect(wrapper.get('button').element.disabled).toBe(true)
  })
})
