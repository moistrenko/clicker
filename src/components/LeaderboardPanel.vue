<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCookies } from '@/game/format/numbers'
import { i18n, numberLocaleForApp, type AppLocale } from '@/i18n'
import { useDuelStore } from '@/stores/duel'

const duel = useDuelStore()
const { t } = useI18n()

onMounted(() => {
  void duel.refreshLeaderboard()
})

function format(value: number): string {
  const locale = numberLocaleForApp(i18n.global.locale.value as AppLocale)
  return formatCookies(value, { locale })
}
</script>

<template>
  <section class="leaderboard" :aria-label="t('multiplayer.leaderboardTitle')">
    <header class="leaderboard__head">
      <h2>{{ t('multiplayer.leaderboardTitle') }}</h2>
      <button type="button" class="leaderboard__refresh" @click="duel.refreshLeaderboard()">
        {{ t('multiplayer.refresh') }}
      </button>
    </header>

    <p v-if="duel.leaderboard.length === 0" class="leaderboard__empty">
      {{ t('multiplayer.leaderboardEmpty') }}
    </p>

    <ol v-else class="leaderboard__list">
      <li v-for="(entry, index) in duel.leaderboard" :key="entry.id">
        <span class="leaderboard__rank">{{ index + 1 }}</span>
        <span class="leaderboard__name">{{ entry.displayName }}</span>
        <span class="leaderboard__kills">{{ format(entry.lifetimeKills) }}</span>
        <span class="leaderboard__record">{{ entry.duelWins }}–{{ entry.duelLosses }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.leaderboard {
  border-top: 1px solid #4a5a46;
  padding-top: 0.75rem;
  display: grid;
  gap: 0.55rem;
}

.leaderboard__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.leaderboard__head h2 {
  margin: 0;
  font-family: Rajdhani, 'Source Sans 3', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ecf7a;
}

.leaderboard__refresh {
  border: 0;
  background: transparent;
  color: #8fa888;
  cursor: pointer;
  font-size: 0.72rem;
  text-decoration: underline;
}

.leaderboard__empty {
  margin: 0;
  font-size: 0.78rem;
  color: #8fa888;
}

.leaderboard__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.35rem;
}

.leaderboard__list li {
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 1fr) auto auto;
  gap: 0.45rem;
  align-items: center;
  padding: 0.35rem 0.45rem;
  background: rgba(0, 0, 0, 0.18);
  font-size: 0.78rem;
}

.leaderboard__rank {
  color: #8fa888;
  font-variant-numeric: tabular-nums;
}

.leaderboard__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e8f0e4;
}

.leaderboard__kills {
  color: #b8f0a0;
  font-variant-numeric: tabular-nums;
}

.leaderboard__record {
  color: #cbb89a;
  font-variant-numeric: tabular-nums;
  min-width: 2.6rem;
  text-align: right;
}
</style>
