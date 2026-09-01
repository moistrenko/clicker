<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCookies } from '@/game/format/numbers'
import { i18n, numberLocaleForApp, type AppLocale } from '@/i18n'
import { isSupabaseConfigured } from '@/multiplayer'
import { useDuelStore } from '@/stores/duel'

const duel = useDuelStore()
const { t } = useI18n()

onMounted(() => {
  void duel.refreshLeaderboard()
  void duel.syncProfileKills()
  void duel.resumePendingDuel()
})

function format(value: number): string {
  const locale = numberLocaleForApp(i18n.global.locale.value as AppLocale)
  return formatCookies(value, { locale })
}

function formatTime(total: number): string {
  if (!Number.isFinite(total) || total < 0) {
    return '--:--'
  }
  const minutes = Math.floor(total / 60)
  const seconds = Math.floor(total % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const modeLabel = computed(() =>
  isSupabaseConfigured() ? t('multiplayer.modeOnline') : t('multiplayer.modeLocal'),
)
</script>

<template>
  <section class="duel-panel" :aria-label="t('multiplayer.duelTitle')">
    <header class="duel-panel__head">
      <h2>{{ t('multiplayer.duelTitle') }}</h2>
      <span class="duel-panel__mode">{{ modeLabel }}</span>
    </header>
    <p class="duel-panel__hint">{{ t('multiplayer.duelHint') }}</p>

    <div v-if="duel.phase === 'idle'" class="duel-panel__actions">
      <button type="button" class="duel-panel__btn" @click="duel.findMatch()">
        {{ t('multiplayer.findDuel') }}
      </button>
    </div>

    <div v-else-if="duel.phase === 'searching'" class="duel-panel__status">
      <p>{{ t('multiplayer.searching') }}</p>
      <button type="button" class="duel-panel__btn duel-panel__btn--ghost" @click="duel.cancelSearch()">
        {{ t('multiplayer.cancelSearch') }}
      </button>
    </div>

    <div v-else-if="duel.phase === 'active'" class="duel-panel__active">
      <p class="duel-panel__timer">{{ t('multiplayer.timeLeft', { time: formatTime(duel.remainingSeconds) }) }}</p>
      <div class="duel-panel__scores">
        <div>
          <span>{{ t('multiplayer.you') }}</span>
          <strong>{{ format(duel.myScore()) }}</strong>
        </div>
        <div>
          <span>{{ t('multiplayer.opponent') }}</span>
          <strong>{{ format(duel.theirScore()) }}</strong>
        </div>
      </div>
    </div>

    <div v-else-if="duel.phase === 'result'" class="duel-panel__result">
      <p v-if="duel.resultKind === 'win'">
        {{ t('multiplayer.youWon') }}
      </p>
      <p v-else-if="duel.resultKind === 'draw'">
        {{ t('multiplayer.youDrew') }}
      </p>
      <p v-else>{{ t('multiplayer.youLost') }}</p>
      <p class="duel-panel__result-scores">
        {{ t('multiplayer.finalScores', { you: format(duel.myScore()), them: format(duel.theirScore()) }) }}
      </p>
      <button type="button" class="duel-panel__btn" @click="duel.dismissResult()">
        {{ t('multiplayer.continue') }}
      </button>
    </div>

    <div v-else-if="duel.phase === 'error'" class="duel-panel__error">
      <p>{{ duel.errorMessage || t('multiplayer.errorGeneric') }}</p>
      <button type="button" class="duel-panel__btn" @click="duel.dismissResult()">
        {{ t('multiplayer.continue') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.duel-panel {
  border-top: 1px solid #4a5a46;
  padding-top: 0.75rem;
  display: grid;
  gap: 0.55rem;
}

.duel-panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.duel-panel__head h2 {
  margin: 0;
  font-family: Rajdhani, 'Source Sans 3', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ecf7a;
}

.duel-panel__mode {
  font-size: 0.68rem;
  color: #8fa888;
}

.duel-panel__hint,
.duel-panel__status p,
.duel-panel__result p,
.duel-panel__error p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: #c8d8c0;
}

.duel-panel__btn {
  border: 1px solid #6a8f4a;
  background: linear-gradient(180deg, #4a6a38 0%, #334a28 100%);
  color: #f0f8ec;
  padding: 0.45rem 0.85rem;
  border-radius: 0.35rem;
  cursor: pointer;
  font-weight: 700;
}

.duel-panel__btn--ghost {
  background: transparent;
  color: #b8d4ae;
}

.duel-panel__timer {
  font-family: Rajdhani, 'Source Sans 3', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffe7b3;
  margin: 0;
}

.duel-panel__scores {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.duel-panel__scores div {
  display: grid;
  gap: 0.15rem;
  padding: 0.45rem 0.55rem;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(126, 207, 90, 0.2);
}

.duel-panel__scores span {
  font-size: 0.68rem;
  color: #8fa888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.duel-panel__scores strong {
  font-size: 0.95rem;
  color: #e8f0e4;
}

.duel-panel__result-scores {
  color: #9ecf7a !important;
}
</style>
