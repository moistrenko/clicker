import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BuildingRow from '@/components/BuildingRow.vue'
import { i18n } from '@/i18n'

describe('BuildingRow', () => {
  it('is enabled when affordable', () => {
    const wrapper = mount(BuildingRow, {
      global: { plugins: [i18n] },
      props: {
        name: 'Cursor',
        owned: 0,
        price: 15,
        affordable: true,
      },
    })
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('Cursor')
    expect(wrapper.text()).toContain('15')
  })

  it('is disabled when unaffordable', () => {
    const wrapper = mount(BuildingRow, {
      global: { plugins: [i18n] },
      props: {
        name: 'Cursor',
        owned: 0,
        price: 15,
        affordable: false,
      },
    })
    expect(wrapper.get('button').element.disabled).toBe(true)
  })

  it('shows a mystery label when locked and stays disabled', () => {
    const wrapper = mount(BuildingRow, {
      global: { plugins: [i18n] },
      props: {
        name: 'Mine',
        owned: 0,
        price: 12_000,
        affordable: true,
        locked: true,
      },
    })
    expect(wrapper.text()).toContain('???')
    expect(wrapper.text()).not.toContain('Mine')
    expect(wrapper.get('button').element.disabled).toBe(true)
  })
})
