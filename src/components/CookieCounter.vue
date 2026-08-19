<script setup lang="ts">
import { clickTarget } from '@/theme/clickTarget'

defineProps<{
  cookies: string
  cps: string
}>()
</script>

<template>
  <div class="cookie-counter">
    <p class="cookie-counter__amount">{{ cookies }}</p>
    <p class="cookie-counter__noun">{{ clickTarget.pluralName }}</p>
    <p class="cookie-counter__cps">{{ cps }} {{ clickTarget.perSecondSuffix }}</p>
  </div>
</template>

<style scoped>
.cookie-counter {
  text-align: center;
}

.cookie-counter__amount {
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  font-weight: 800;
  line-height: 1.05;
  color: #e8f0e4;
  letter-spacing: -0.03em;
}

.cookie-counter__noun {
  font-size: 1.15rem;
  color: #b8d4ae;
  text-transform: lowercase;
}

.cookie-counter__cps {
  margin-top: 0.35rem;
  color: #9ecf7a;
  font-size: 0.95rem;
}
</style>
