<script setup lang="ts">
import { clickTarget } from '@/theme/clickTarget'

defineProps<{
  x: number
  y: number
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="elite-zombie"
    type="button"
    :aria-label="clickTarget.collectBonusLabel"
    :style="{ left: `${x * 100}%`, top: `${y * 100}%` }"
    @click="emit('click')"
  >
    <span class="elite-zombie__glow" aria-hidden="true" />
    <span class="elite-zombie__body" aria-hidden="true">
      <span class="elite-zombie__eye elite-zombie__eye--left" />
      <span class="elite-zombie__eye elite-zombie__eye--right" />
      <span class="elite-zombie__mouth" />
    </span>
  </button>
</template>

<style scoped>
.elite-zombie {
  position: absolute;
  width: 58px;
  height: 58px;
  padding: 0;
  border: 0;
  background: transparent;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 4;
  animation: elite-float 2.8s ease-in-out infinite;
}

.elite-zombie__glow {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(126, 207, 90, 0.85), rgba(60, 140, 50, 0));
  animation: elite-pulse 1.6s ease-in-out infinite;
}

.elite-zombie__body {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 45% 45%;
  background:
    radial-gradient(circle at 38% 28%, #b8f0a0 0%, #7ecf5a 38%, #4a8a3a 72%, #2a5028 100%);
  box-shadow:
    inset 0 3px 6px rgba(255, 255, 255, 0.35),
    inset 0 -5px 8px rgba(20, 40, 16, 0.45),
    0 8px 16px rgba(0, 0, 0, 0.45);
}

.elite-zombie__eye {
  position: absolute;
  width: 10px;
  height: 12px;
  border-radius: 50%;
  background: #1a1010;
  top: 34%;
}

.elite-zombie__eye--left {
  left: 28%;
}

.elite-zombie__eye--right {
  right: 28%;
}

.elite-zombie__eye::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ff4444;
  top: 2px;
  left: 3px;
}

.elite-zombie__mouth {
  position: absolute;
  left: 50%;
  top: 58%;
  width: 18px;
  height: 8px;
  transform: translateX(-50%);
  border-radius: 0 0 10px 10px;
  background: #3a1818;
}

.elite-zombie:hover .elite-zombie__body {
  transform: scale(1.08);
}

.elite-zombie:active .elite-zombie__body {
  transform: scale(0.94);
}

.elite-zombie__body {
  transition: transform 0.12s ease;
}

@keyframes elite-float {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-8px);
  }
}

@keyframes elite-pulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.92);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}
</style>
