<script setup lang="ts">
import type { BuffListing } from '@/game/types'

defineProps<{
  buffs: BuffListing[]
}>()

function formatRemaining(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const remainder = Math.floor(seconds % 60)
    return `${minutes}:${remainder.toString().padStart(2, '0')}`
  }
  return `${Math.ceil(seconds)}s`
}
</script>

<template>
  <div v-if="buffs.length > 0" class="buff-bar" aria-label="Active buffs">
    <article v-for="buff in buffs" :key="buff.id" class="buff-bar__item">
      <div class="buff-bar__header">
        <strong class="buff-bar__name">{{ buff.name }}</strong>
        <span class="buff-bar__timer">{{ formatRemaining(buff.remainingSeconds) }}</span>
      </div>
      <p class="buff-bar__desc">{{ buff.description }}</p>
    </article>
  </div>
</template>

<style scoped>
.buff-bar {
  display: grid;
  gap: 0.45rem;
  width: min(100%, 360px);
}

.buff-bar__item {
  padding: 0.55rem 0.7rem;
  border-radius: 0.65rem;
  background: rgba(255, 248, 226, 0.82);
  border: 1px solid rgba(214, 154, 58, 0.55);
  box-shadow: 0 4px 10px rgba(92, 48, 12, 0.12);
}

.buff-bar__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.buff-bar__name {
  font-size: 0.92rem;
  color: #6b3a12;
  letter-spacing: 0.03em;
}

.buff-bar__timer {
  font-variant-numeric: tabular-nums;
  font-size: 0.82rem;
  font-weight: 700;
  color: #9a6208;
}

.buff-bar__desc {
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: #855629;
}
</style>
