<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { formatCookies } from '@/game/format/numbers'

const props = defineProps<{
  kills: number
}>()

const emit = defineEmits<{
  dismissed: []
}>()

const visible = ref(false)
let dismissTimer: ReturnType<typeof setTimeout> | undefined

const formattedKills = computed(() => formatCookies(props.kills))

function show() {
  if (!(props.kills > 0)) {
    visible.value = false
    return
  }
  visible.value = true
  if (dismissTimer !== undefined) {
    clearTimeout(dismissTimer)
  }
  dismissTimer = setTimeout(dismiss, 5200)
}

function dismiss() {
  if (dismissTimer !== undefined) {
    clearTimeout(dismissTimer)
    dismissTimer = undefined
  }
  visible.value = false
  window.setTimeout(() => emit('dismissed'), 300)
}

watch(
  () => props.kills,
  () => {
    show()
  },
)

onMounted(() => {
  show()
})
</script>

<template>
  <Transition name="offline-banner">
    <article
      v-if="visible && kills > 0"
      class="offline-banner"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="offline-banner__icon" aria-hidden="true">🧟</span>
      <div class="offline-banner__body">
        <p class="offline-banner__label">While you were away</p>
        <p class="offline-banner__message">
          you scored <strong>{{ formattedKills }}</strong> kills
        </p>
      </div>
      <button type="button" class="offline-banner__close" aria-label="Dismiss" @click="dismiss">
        ×
      </button>
    </article>
  </Transition>
</template>

<style scoped>
.offline-banner {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
  width: min(92vw, 420px);
  padding: 0.85rem 0.95rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3d4a3a 0%, #2a3428 100%);
  border: 1px solid rgba(126, 207, 90, 0.45);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
}

.offline-banner__icon {
  font-size: 1.6rem;
  line-height: 1;
}

.offline-banner__label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ecf7a;
}

.offline-banner__message {
  margin-top: 0.15rem;
  font-size: 0.95rem;
  color: #e8f0e4;
}

.offline-banner__message strong {
  color: #b8ff9a;
}

.offline-banner__close {
  border: 0;
  background: transparent;
  color: #9ecf7a;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.offline-banner-enter-active,
.offline-banner-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.offline-banner-enter-from,
.offline-banner-leave-to {
  transform: translateX(-50%) translateY(-110%);
  opacity: 0;
}
</style>
