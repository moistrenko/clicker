<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { rankFromKills } from '@/game/engine/prestige'
import { useDuelStore } from '@/stores/duel'

const duel = useDuelStore()
const { t } = useI18n()

onMounted(() => {
  void duel.refreshLeaderboard()
})

function survivorRank(lifetimeKills: number): number {
  return rankFromKills(lifetimeKills)
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
      <li
        v-for="(entry, index) in duel.leaderboard"
        :key="entry.id"
        :class="{ 'leaderboard__row--you': entry.id === duel.profile?.id }"
      >
        <span class="leaderboard__place">{{ index + 1 }}</span>
        <span class="leaderboard__name">
          {{ entry.displayName }}
          <span v-if="entry.id === duel.profile?.id" class="leaderboard__you-tag">{{ t('multiplayer.youTag') }}</span>
        </span>
        <span class="leaderboard__survivor-rank" :title="t('ui.survivorRank')">
          {{ t('multiplayer.leaderboardRank', { rank: survivorRank(entry.lifetimeKills) }) }}
        </span>
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

.leaderboard__row--you {
  border: 1px solid rgba(126, 207, 90, 0.35);
  background: rgba(61, 90, 52, 0.28);
}

.leaderboard__you-tag {
  margin-left: 0.35rem;
  font-size: 0.62rem;
  color: #9ecf7a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.leaderboard__place {
  color: #8fa888;
  font-variant-numeric: tabular-nums;
}

.leaderboard__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e8f0e4;
}

.leaderboard__survivor-rank {
  color: #b8f0a0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.leaderboard__record {
  color: #cbb89a;
  font-variant-numeric: tabular-nums;
  min-width: 2.6rem;
  text-align: right;
}
</style>
