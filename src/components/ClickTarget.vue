<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { clickTarget } from '@/theme/clickTarget'
import { formatCookies } from '@/game/format/numbers'
import { i18n, numberLocaleForApp, type AppLocale } from '@/i18n'

interface Floaty {
  id: number
  amount: string
  x: number
  y: number
}

const props = withDefaults(
  defineProps<{
    gain?: number
  }>(),
  { gain: 1 },
)

const emit = defineEmits<{
  click: []
}>()

const { t } = useI18n()

function formatGain(value: number): string {
  const locale = numberLocaleForApp(i18n.global.locale.value as AppLocale)
  return formatCookies(value, { locale })
}

const pressed = ref(false)
const wobbling = ref(false)
const floaties = ref<Floaty[]>([])
let nextId = 0
const timers = new Set<ReturnType<typeof setTimeout>>()

function spawnFloaty() {
  const id = nextId
  nextId += 1
  floaties.value.push({
    id,
    amount: `+${formatGain(props.gain)}`,
    x: 38 + Math.random() * 24,
    y: 28 + Math.random() * 18,
  })
  const timer = setTimeout(() => {
    floaties.value = floaties.value.filter((item) => item.id !== id)
    timers.delete(timer)
  }, 800)
  timers.add(timer)
}

function onClick() {
  wobbling.value = false
  requestAnimationFrame(() => {
    wobbling.value = true
  })
  spawnFloaty()
  emit('click')
}

onBeforeUnmount(() => {
  for (const timer of timers) {
    clearTimeout(timer)
  }
  timers.clear()
})
</script>

<template>
  <div class="click-stage">
    <div class="click-target__shadow" aria-hidden="true" />
    <button
      class="click-target"
      type="button"
      data-testid="click-target"
      :class="{ pressed, wobble: wobbling }"
      :aria-label="t('game.clickActionLabel')"
      @pointerdown="pressed = true"
      @pointerup="pressed = false"
      @pointerleave="pressed = false"
      @animationend="wobbling = false"
      @click="onClick"
    >
      <img
        class="click-target__image"
        :src="clickTarget.imageUrl"
        :alt="t('game.alt')"
        draggable="false"
      />
    </button>
    <div class="floaty-layer" aria-hidden="true">
      <span
        v-for="floaty in floaties"
        :key="floaty.id"
        class="floaty"
        :style="{ left: `${floaty.x}%`, top: `${floaty.y}%` }"
      >
        {{ floaty.amount }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.click-stage {
  position: relative;
  isolation: isolate;
  width: min(68vw, 280px);
  height: min(68vw, 280px);
  margin: 0 auto;
  user-select: none;
}

.click-target__shadow {
  position: absolute;
  left: 50%;
  bottom: 2%;
  width: 68%;
  height: 8%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.38), transparent 72%);
  pointer-events: none;
}

.click-target {
  position: absolute;
  inset: 0;
  z-index: 1;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: 50% 75%;
  transition: transform 0.08s ease-out;
}

.click-target__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  filter:
    drop-shadow(0 0 1px rgba(232, 240, 228, 0.95))
    drop-shadow(0 0 4px rgba(200, 220, 192, 0.45));
  pointer-events: none;
}

.click-target.pressed {
  transform: scale(0.97) translateY(2px);
}

.click-target.wobble {
  animation: hit-recoil 0.32s ease-out;
}

.floaty-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: visible;
}

.floaty {
  position: absolute;
  pointer-events: none;
  font-weight: 800;
  font-size: 1.45rem;
  color: #b8f0a0;
  text-shadow:
    0 0 8px rgba(126, 207, 90, 0.55),
    0 2px 0 #1a2218;
  animation: float-up 0.85s ease-out forwards;
}

@keyframes hit-recoil {
  0% {
    transform: scale(0.97) translateY(2px) rotate(0deg);
  }
  30% {
    transform: scale(1.02) translateY(-3px) rotate(-2deg);
  }
  60% {
    transform: scale(0.99) translateY(0) rotate(1deg);
  }
  100% {
    transform: scale(1) translateY(0) rotate(0deg);
  }
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -52px) scale(1.08);
  }
}
</style>
