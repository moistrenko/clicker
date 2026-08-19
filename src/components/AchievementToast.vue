<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { AchievementDef } from '@/game/types'
import { useCatalogText } from '@/i18n/useCatalogText'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  achievement: AchievementDef | null
}>()

const emit = defineEmits<{
  dismissed: []
}>()

const { t } = useI18n()
const { achievementName, achievementDescription } = useCatalogText()
const visible = ref(false)
let dismissTimer: ReturnType<typeof setTimeout> | undefined

function show() {
  if (!props.achievement) {
    visible.value = false
    return
  }
  visible.value = true
  if (dismissTimer !== undefined) {
    clearTimeout(dismissTimer)
  }
  dismissTimer = setTimeout(dismiss, 4200)
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
  () => props.achievement,
  () => {
    show()
  },
)

onMounted(() => {
  show()
})
</script>

<template>
  <Transition name="achievement-toast">
    <article
      v-if="visible && achievement"
      class="achievement-toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="achievement-toast__icon" aria-hidden="true">{{ achievement.icon }}</span>
      <div class="achievement-toast__body">
        <p class="achievement-toast__label">{{ t('ui.achievementUnlocked') }}</p>
        <strong class="achievement-toast__name">{{ achievementName(achievement) }}</strong>
        <p class="achievement-toast__desc">{{ achievementDescription(achievement) }}</p>
      </div>
      <button type="button" class="achievement-toast__close" :aria-label="t('ui.dismiss')" @click="dismiss">
        ×
      </button>
    </article>
  </Transition>
</template>

<style scoped>
.achievement-toast {
  position: fixed;
  top: max(3.75rem, calc(env(safe-area-inset-top, 0px) + 3.25rem));
  right: max(0.75rem, env(safe-area-inset-right, 0px));
  z-index: 100;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
  width: min(calc(100vw - 1.5rem), 360px);
  padding: 0.85rem 0.9rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3a4a38 0%, #2a3428 100%);
  border: 1px solid rgba(126, 207, 90, 0.55);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
}

.achievement-toast__icon {
  font-size: 1.8rem;
  line-height: 1;
}

.achievement-toast__label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ecf7a;
}

.achievement-toast__name {
  display: block;
  margin-top: 0.15rem;
  font-size: 1rem;
  color: #e8f0e4;
}

.achievement-toast__desc {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  color: #b8d4ae;
}

.achievement-toast__close {
  border: 0;
  background: transparent;
  color: #9ecf7a;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.achievement-toast-enter-active,
.achievement-toast-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.achievement-toast-enter-from,
.achievement-toast-leave-to {
  transform: translateX(110%);
  opacity: 0;
}

@media (max-width: 720px) {
  .achievement-toast {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }

  .achievement-toast-enter-from,
  .achievement-toast-leave-to {
    transform: translateX(-50%) translateY(-110%);
  }
}
</style>
