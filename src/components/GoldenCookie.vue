<script setup lang="ts">
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
    class="golden-cookie"
    type="button"
    aria-label="Collect golden cookie"
    :style="{ left: `${x * 100}%`, top: `${y * 100}%` }"
    @click="emit('click')"
  >
    <span class="golden-cookie__glow" aria-hidden="true" />
    <span class="golden-cookie__body" aria-hidden="true">
      <span class="golden-cookie__chip golden-cookie__chip--one" />
      <span class="golden-cookie__chip golden-cookie__chip--two" />
      <span class="golden-cookie__chip golden-cookie__chip--three" />
      <span class="golden-cookie__chip golden-cookie__chip--four" />
    </span>
  </button>
</template>

<style scoped>
.golden-cookie {
  position: absolute;
  width: 58px;
  height: 58px;
  padding: 0;
  border: 0;
  background: transparent;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 4;
  animation: golden-float 2.8s ease-in-out infinite;
}

.golden-cookie__glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 220, 120, 0.75), rgba(255, 180, 40, 0));
  animation: golden-pulse 1.6s ease-in-out infinite;
}

.golden-cookie__body {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 28%, #fff6c8 0%, #ffd86a 34%, #d89a1d 72%, #9a6208 100%);
  box-shadow:
    inset 0 3px 6px rgba(255, 255, 255, 0.55),
    inset 0 -5px 8px rgba(120, 70, 8, 0.35),
    0 8px 16px rgba(92, 48, 12, 0.35);
}

.golden-cookie__chip {
  position: absolute;
  border-radius: 50%;
  background: rgba(156, 92, 10, 0.45);
}

.golden-cookie__chip--one {
  width: 9px;
  height: 9px;
  top: 22%;
  left: 28%;
}

.golden-cookie__chip--two {
  width: 7px;
  height: 7px;
  top: 48%;
  left: 58%;
}

.golden-cookie__chip--three {
  width: 8px;
  height: 8px;
  top: 62%;
  left: 30%;
}

.golden-cookie__chip--four {
  width: 6px;
  height: 6px;
  top: 34%;
  left: 62%;
}

.golden-cookie:hover .golden-cookie__body {
  transform: scale(1.08);
}

.golden-cookie:active .golden-cookie__body {
  transform: scale(0.94);
}

.golden-cookie__body {
  transition: transform 0.12s ease;
}

@keyframes golden-float {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-8px);
  }
}

@keyframes golden-pulse {
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
