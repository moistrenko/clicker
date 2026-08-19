<script setup lang="ts">
import type { AchievementListing } from '@/game/types'
import { useCatalogText } from '@/i18n/useCatalogText'
import { useI18n } from 'vue-i18n'

defineProps<{
  listings: AchievementListing[]
}>()

const { t } = useI18n()
const { achievementName, achievementDescription } = useCatalogText()

const unlockedCount = (listings: AchievementListing[]) =>
  listings.filter((entry) => entry.unlocked).length
</script>

<template>
  <section class="achievements" :aria-label="t('ui.achievements')">
    <header class="achievements__header">
      <h2>{{ t('ui.achievements') }}</h2>
      <span class="achievements__count">{{ unlockedCount(listings) }} / {{ listings.length }}</span>
    </header>
    <ul class="achievements__grid">
      <li
        v-for="{ achievement, unlocked } in listings"
        :key="achievement.id"
        class="achievements__item"
        :class="{ 'achievements__item--locked': !unlocked }"
      >
        <span class="achievements__icon" aria-hidden="true">
          {{ unlocked ? achievement.icon : t('ui.locked') }}
        </span>
        <div class="achievements__body">
          <strong class="achievements__name">
            {{ unlocked ? achievementName(achievement) : t('ui.locked') }}
          </strong>
          <p class="achievements__desc">
            {{ unlocked ? achievementDescription(achievement) : t('ui.keepSmashing') }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.achievements__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.7rem;
}

.achievements__header h2 {
  font-size: 1.05rem;
  color: #b8d4ae;
}

.achievements__count {
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  color: #9ecf7a;
}

.achievements__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
  max-height: min(52vh, 420px);
  overflow-y: auto;
}

.achievements__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.65rem;
  align-items: start;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  background: rgba(42, 52, 40, 0.85);
  border: 1px solid rgba(126, 207, 90, 0.25);
}

.achievements__item--locked {
  opacity: 0.72;
  border-color: rgba(126, 207, 90, 0.08);
}

.achievements__icon {
  display: grid;
  place-items: center;
  min-width: 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #9ecf7a;
}

.achievements__item--locked .achievements__icon {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: #7a8f72;
}

.achievements__name {
  display: block;
  font-size: 0.9rem;
  color: #e8f0e4;
}

.achievements__desc {
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: #b8d4ae;
}

.achievements__item--locked .achievements__desc {
  color: #8a9a82;
  font-style: italic;
}

@media (max-width: 720px) {
  .achievements__grid {
    max-height: none;
  }
}
</style>
