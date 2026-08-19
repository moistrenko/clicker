import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UpgradeTile from '@/components/UpgradeTile.vue'

describe('UpgradeTile', () => {
  it('is enabled when affordable', () => {
    const wrapper = mount(UpgradeTile, {
      props: {
        name: 'Reinforced index finger',
        description: 'Clicks and cursors bake twice as many cookies.',
        price: 100,
        affordable: true,
      },
    })
    expect(wrapper.get('button').element.disabled).toBe(false)
    expect(wrapper.text()).toContain('100')
  })

  it('is disabled when unaffordable', () => {
    const wrapper = mount(UpgradeTile, {
      props: {
        name: 'Reinforced index finger',
        description: 'Clicks and cursors bake twice as many cookies.',
        price: 100,
        affordable: false,
      },
    })
    expect(wrapper.get('button').element.disabled).toBe(true)
  })
})
