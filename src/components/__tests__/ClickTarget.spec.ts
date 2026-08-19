import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import ClickTarget from '@/components/ClickTarget.vue'
import { i18n } from '@/i18n'
import { STORAGE_KEY } from '@/game/persist/storage'
import { useGameStore } from '@/stores/game'
import { clickTarget } from '@/theme/clickTarget'

describe('ClickTarget', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
    setActivePinia(createPinia())
    i18n.global.locale.value = 'en'
  })

  it('renders the theme image and emits click', async () => {
    const wrapper = mount(ClickTarget, {
      global: { plugins: [i18n] },
    })
    const image = wrapper.get('img')
    expect(image.attributes('src')).toBe(clickTarget.imageUrl)
    expect(image.attributes('alt')).toBe('Zombie')

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('updates the game store when clicked through the parent', async () => {
    const Harness = defineComponent({
      components: { ClickTarget },
      setup() {
        const game = useGameStore()
        return { game }
      },
      template: '<ClickTarget :gain="game.cookiesPerClick" @click="game.clickCookie" />',
    })

    const wrapper = mount(Harness, {
      global: { plugins: [i18n] },
    })
    const game = useGameStore()
    expect(game.cookies).toBe(0)

    await wrapper.get('button').trigger('click')
    expect(game.cookies).toBe(1)
    expect(game.cookiesBakedAllTime).toBe(1)
    game.stop()
  })
})
