<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  cookies: string
  cps: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="cookie-counter">
    <p class="cookie-counter__amount">{{ cookies }}</p>
    <p class="cookie-counter__noun">{{ t('game.pluralName') }}</p>
    <p class="cookie-counter__cps">{{ cps }} {{ t('game.perSecondSuffix') }}</p>
  </div>
</template>

<style scoped>
.cookie-counter {
  text-align: center;
}

.cookie-counter__amount {
  font-size: clamp(1.85rem, 6vw, 3.4rem);
  font-weight: 800;
  line-height: 1.05;
  color: #e8f0e4;
  letter-spacing: -0.03em;
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
