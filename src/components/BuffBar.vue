<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BuffListing } from '@/game/types'
import { useCatalogText } from '@/i18n/useCatalogText'

const props = defineProps<{
  buffs: BuffListing[]
}>()

const { t } = useI18n()
const { buffName, buffDescription, buildingName } = useCatalogText()

function formatRemaining(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const remainder = Math.floor(seconds % 60)
    return `${minutes}:${remainder.toString().padStart(2, '0')}`
  }
  return `${Math.ceil(seconds)}s`
}

function localizedDescription(buff: BuffListing): string {
  if (buff.type === 'buildingSpecial' && buff.buildingId) {
    return t('buffs.buildingProduction', {
      building: buildingName(buff.buildingId),
      multiplier: buff.multiplier ?? 7,
    })
  }
  return buffDescription(buff.type, buff.description)
}

const localizedBuffs = computed(() =>
  props.buffs.map((buff) => ({
    ...buff,
    localizedName: buffName(buff.type),
    localizedDescription: localizedDescription(buff),
  })),
)
</script>

<template>
  <div v-if="localizedBuffs.length > 0" class="buff-bar" :aria-label="t('ui.activeBuffs')">
    <article v-for="buff in localizedBuffs" :key="buff.id" class="buff-bar__item">
      <div class="buff-bar__header">
        <strong class="buff-bar__name">{{ buff.localizedName }}</strong>
        <span class="buff-bar__timer">{{ formatRemaining(buff.remainingSeconds) }}</span>
      </div>
      <p class="buff-bar__desc">{{ buff.localizedDescription }}</p>
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
  background: rgba(42, 52, 40, 0.9);
  border: 1px solid rgba(126, 207, 90, 0.45);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.buff-bar__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.buff-bar__name {
  font-size: 0.92rem;
  color: #9ecf7a;
  letter-spacing: 0.03em;
}

.buff-bar__timer {
  font-variant-numeric: tabular-nums;
  font-size: 0.82rem;
  font-weight: 700;
  color: #c62828;
}

.buff-bar__desc {
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: #b8d4ae;
}
</style>
