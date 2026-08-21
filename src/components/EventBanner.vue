<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { WorldEventListing } from '@/game/types'

const props = defineProps<{
  events: WorldEventListing[]
}>()

const { t, te } = useI18n()

function formatRemaining(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const remainder = Math.floor(seconds % 60)
    return `${minutes}:${remainder.toString().padStart(2, '0')}`
  }
  return `${Math.ceil(seconds)}s`
}

const localized = computed(() =>
  props.events.map((event) => {
    const nameKey = `events.${event.type}.name`
    const descKey = `events.${event.type}.description`
    return {
      ...event,
      name: te(nameKey) ? t(nameKey) : event.type,
      description: te(descKey) ? t(descKey) : '',
    }
  }),
)
</script>

<template>
  <div v-if="localized.length" class="events" role="status">
    <article v-for="event in localized" :key="event.id" class="events__item" :data-type="event.type">
      <div class="events__head">
        <strong>{{ event.name }}</strong>
        <span>{{ formatRemaining(event.remainingSeconds) }}</span>
      </div>
      <p>{{ event.description }}</p>
    </article>
  </div>
</template>

<style scoped>
.events {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.events__item {
  border: 1px solid #5d4630;
  background: linear-gradient(120deg, rgba(72, 42, 18, 0.55), rgba(28, 36, 24, 0.7));
  padding: 0.55rem 0.7rem;
  color: #f0d7b4;
}

.events__item[data-type='hordeNight'] {
  border-color: #7a2f2f;
  background: linear-gradient(120deg, rgba(90, 20, 20, 0.55), rgba(28, 24, 24, 0.7));
}

.events__item[data-type='adrenalineRush'] {
  border-color: #6a5a20;
}

.events__item[data-type='eliteHunt'] {
  border-color: #3f5f8a;
}

.events__head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.82rem;
}

.events__item p {
  margin: 0.25rem 0 0;
  font-size: 0.72rem;
  line-height: 1.35;
  color: #cbb89a;
}
</style>
