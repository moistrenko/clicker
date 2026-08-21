import { onMounted, onUnmounted, ref } from 'vue'

export type BuyBulk = 1 | 10 | 20 | 100

export function resolveBuyBulk(modifiers: {
  shiftKey: boolean
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
}): BuyBulk {
  if (modifiers.ctrlKey || modifiers.metaKey) {
    return 100
  }
  if (modifiers.altKey) {
    return 20
  }
  if (modifiers.shiftKey) {
    return 10
  }
  return 1
}

export function useBuyBulk() {
  const bulk = ref<BuyBulk>(1)

  function syncFromEvent(event: KeyboardEvent | MouseEvent) {
    bulk.value = resolveBuyBulk(event)
  }

  function reset() {
    bulk.value = 1
  }

  onMounted(() => {
    window.addEventListener('keydown', syncFromEvent)
    window.addEventListener('keyup', syncFromEvent)
    window.addEventListener('blur', reset)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', syncFromEvent)
    window.removeEventListener('keyup', syncFromEvent)
    window.removeEventListener('blur', reset)
  })

  return { bulk }
}
