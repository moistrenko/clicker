<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  coefficient: string
  scale?: string | null
  cps: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="cookie-counter" data-testid="kill-counter">
    <div class="cookie-counter__amount" aria-live="polite" data-testid="kill-amount">
      <p class="cookie-counter__coefficient" data-testid="kill-coefficient">{{ coefficient }}</p>
      <p class="cookie-counter__scale" :class="{ 'cookie-counter__scale--empty': !scale }">
        {{ scale || '\u00A0' }}
      </p>
    </div>
    <p class="cookie-counter__noun">{{ t('game.pluralName') }}</p>
    <p class="cookie-counter__cps">{{ cps }} {{ t('game.perSecondSuffix') }}</p>
  </div>
</template>

<style scoped>
.cookie-counter {
  text-align: center;
}

.cookie-counter__amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: calc(1.05em * 2);
  font-size: clamp(1.85rem, 6vw, 3.4rem);
  font-weight: 800;
  line-height: 1.05;
  color: #e8f0e4;
  letter-spacing: -0.03em;
}

.cookie-counter__coefficient,
.cookie-counter__scale {
  margin: 0;
  max-width: 100%;
  white-space: nowrap;
}

.cookie-counter__scale {
  font-size: 0.72em;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #d0e0c8;
}

.cookie-counter__scale--empty {
  visibility: hidden;
}

.cookie-counter__noun {
  font-size: clamp(0.95rem, 2.8vw, 1.15rem);
  color: #b8d4ae;
  text-transform: lowercase;
}

.cookie-counter__cps {
  margin-top: 0.35rem;
  color: #9ecf7a;
  font-size: clamp(0.82rem, 2.4vw, 0.95rem);
}
</style>
