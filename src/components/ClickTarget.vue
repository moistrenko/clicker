<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { clickTarget } from '@/theme/clickTarget'
import { formatCookies } from '@/game/format/numbers'

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
    amount: `+${formatCookies(props.gain)}`,
    x: 42 + Math.random() * 16,
    y: 28 + Math.random() * 20,
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
    <button
      class="click-target"
      type="button"
      :class="{ pressed, wobble: wobbling }"
      :aria-label="`Bake ${clickTarget.pluralName}`"
      @pointerdown="pressed = true"
      @pointerup="pressed = false"
      @pointerleave="pressed = false"
      @animationend="wobbling = false"
      @click="onClick"
    >
      <img
        class="click-target__image"
        :src="clickTarget.imageUrl"
        :alt="clickTarget.alt"
        draggable="false"
      />
    </button>
    <span
      v-for="floaty in floaties"
      :key="floaty.id"
      class="floaty"
      :style="{ left: `${floaty.x}%`, top: `${floaty.y}%` }"
    >
      {{ floaty.amount }}
    </span>
  </div>
</template>

<style scoped>
.click-stage {
  position: relative;
  width: min(78vw, 340px);
  height: min(78vw, 340px);
  margin: 0 auto;
  user-select: none;
}

.click-target {
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: 50% 62%;
}

.click-target__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 16px rgba(92, 48, 12, 0.28));
  pointer-events: none;
}

.click-target.pressed .click-target__image {
  transform: scale(0.92);
}

.click-target.wobble .click-target__image {
  animation: wobble 0.38s ease;
}

.floaty {
  position: absolute;
  pointer-events: none;
  font-weight: 800;
  font-size: 1.35rem;
  color: #6b3a12;
  text-shadow: 0 1px 0 #fff4d8;
  animation: float-up 0.8s ease-out forwards;
}

@keyframes wobble {
  0% {
    transform: scale(0.92) rotate(0deg);
  }
  35% {
    transform: scale(1.08) rotate(-6deg);
  }
  70% {
    transform: scale(0.98) rotate(4deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -46px);
  }
}
</style>
