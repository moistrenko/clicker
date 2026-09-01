import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createInitialState, totalLifetimeKills } from '@/game/engine'
import type { GameState } from '@/game/types'
import {
  applyDuelOutcome,
  BOT_USER_ID,
  computeSettleRewards,
  DUEL_DURATION_SECONDS,
  DUEL_SCORE_REPORT_INTERVAL_MS,
  getMultiplayerBackend,
  opponentScore,
  ownScore,
  resolveDuelResultKind,
  type DuelMatch,
  type LeaderboardEntry,
  type MultiplayerProfile,
} from '@/multiplayer'
import { useGameStore } from '@/stores/game'

export type DuelPhase = 'idle' | 'searching' | 'active' | 'result' | 'error'

export const useDuelStore = defineStore('duel', () => {
  const phase = ref<DuelPhase>('idle')
  const errorMessage = ref('')
  const profile = ref<MultiplayerProfile | null>(null)
  const match = ref<DuelMatch | null>(null)
  const leaderboard = ref<LeaderboardEntry[]>([])
  const resultKind = ref<'win' | 'loss' | 'draw'>('loss')
  const remainingSeconds = ref(0)

  let mainSnapshot: GameState | null = null
  let unsubscribe: (() => void) | null = null
  let reportTimer: number | undefined
  let countdownTimer: number | undefined
  let searchPollTimer: number | undefined
  let localBotTimer: number | undefined
  let usingLocalBot = false
  let endingMatch = false

  const isDueling = computed(() => phase.value === 'active' || phase.value === 'searching')
  const canUseMetaActions = computed(() => phase.value === 'idle' || phase.value === 'result')

  function clearTimers() {
    if (reportTimer !== undefined) {
      window.clearInterval(reportTimer)
      reportTimer = undefined
    }
    if (countdownTimer !== undefined) {
      window.clearInterval(countdownTimer)
      countdownTimer = undefined
    }
    if (searchPollTimer !== undefined) {
      window.clearInterval(searchPollTimer)
      searchPollTimer = undefined
    }
    if (localBotTimer !== undefined) {
      window.clearInterval(localBotTimer)
      localBotTimer = undefined
    }
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  function updateCountdown() {
    if (!match.value || !Number.isFinite(match.value.endsAt)) {
      remainingSeconds.value = 0
      return
    }
    remainingSeconds.value = Math.max(0, Math.ceil((match.value.endsAt - Date.now()) / 1000))
  }

  async function refreshLeaderboard() {
    try {
      const backend = getMultiplayerBackend()
      leaderboard.value = await backend.getLeaderboard(20)
    } catch {
      // keep previous board
    }
  }

  async function syncProfileKills() {
    const game = useGameStore()
    try {
      const backend = getMultiplayerBackend()
      await backend.syncLifetimeKills(totalLifetimeKills(game.state))
      await refreshLeaderboard()
    } catch {
      // optional sync
    }
  }

  function startCountdownTimer() {
    if (countdownTimer !== undefined) {
      window.clearInterval(countdownTimer)
    }
    countdownTimer = window.setInterval(() => {
      updateCountdown()
      if (
        Number.isFinite(remainingSeconds.value) &&
        remainingSeconds.value <= 0 &&
        match.value &&
        !endingMatch
      ) {
        void endActiveMatch()
      }
    }, 250)
  }

  function isMatchExpired(nextMatch: DuelMatch, at = Date.now()): boolean {
    return Number.isFinite(nextMatch.endsAt) && at >= nextMatch.endsAt
  }

  async function settleActiveMatch(): Promise<DuelMatch> {
    if (!match.value) {
      throw new Error('No active duel match')
    }
    if (usingLocalBot) {
      const game = useGameStore()
      const current = { ...match.value }
      if (current.playerA === profile.value?.id) {
        current.scoreA = game.state.cookiesBakedAllTime
      } else if (current.playerB === profile.value?.id) {
        current.scoreB = game.state.cookiesBakedAllTime
      }
      const { winnerId, rewardA, rewardB } = computeSettleRewards(current.scoreA, current.scoreB)
      return {
        ...current,
        status: 'settled',
        winnerId:
          winnerId === 'a' ? current.playerA : winnerId === 'b' ? current.playerB : null,
        rewardA,
        rewardB,
      }
    }

    const backend = getMultiplayerBackend()
    const matchId = match.value.id
    const kills = useGameStore().state.cookiesBakedAllTime
    try {
      const reported = await backend.reportScore(matchId, kills)
      if (reported.status === 'settled') {
        return reported
      }
      return await backend.settle(matchId)
    } catch {
      const current = await backend.getMatch(matchId)
      if (current?.status === 'settled') {
        return current
      }
      throw new Error('Could not settle duel')
    }
  }

  async function beginDuelSession(nextMatch: DuelMatch, localBot = false) {
    if (!nextMatch.id || !Number.isFinite(nextMatch.endsAt) || !Number.isFinite(nextMatch.startedAt)) {
      throw new Error('Invalid duel match payload')
    }
    const game = useGameStore()
    const backend = getMultiplayerBackend()
    if (!profile.value) {
      profile.value = await backend.ensureAuth()
    }

    clearTimers()
    usingLocalBot = localBot
    mainSnapshot = JSON.parse(JSON.stringify(game.state)) as GameState
    game.enterDuelMode(createInitialState())
    match.value = nextMatch
    phase.value = 'active'
    updateCountdown()

    if (localBot) {
      localBotTimer = window.setInterval(() => {
        if (!match.value || match.value.status !== 'active') {
          return
        }
        const elapsed = (Date.now() - match.value.startedAt) / 1000
        const botScore = Math.floor(elapsed * 3)
        match.value = {
          ...match.value,
          scoreA: game.state.cookiesBakedAllTime,
          scoreB: Math.max(match.value.scoreB, botScore),
        }
      }, 500)
    } else {
      unsubscribe = backend.subscribeMatch(nextMatch.id, (updated) => {
        match.value = updated
        updateCountdown()
        if (updated.status === 'settled') {
          void finishDuel(updated)
        }
      })
    }

    reportTimer = window.setInterval(() => {
      void reportCurrentScore()
    }, DUEL_SCORE_REPORT_INTERVAL_MS)

    startCountdownTimer()

    if (nextMatch.status === 'settled') {
      await finishDuel(nextMatch)
      return
    }
    if (isMatchExpired(nextMatch)) {
      await endActiveMatch()
    }
  }

  async function endActiveMatch() {
    if (!match.value || phase.value !== 'active' || endingMatch) {
      return
    }
    endingMatch = true
    if (countdownTimer !== undefined) {
      window.clearInterval(countdownTimer)
      countdownTimer = undefined
    }
    try {
      const settled = await settleActiveMatch()
      match.value = settled
      await finishDuel(settled)
    } catch (error) {
      endingMatch = false
      if (phase.value === 'active' && match.value) {
        startCountdownTimer()
      }
      errorMessage.value = error instanceof Error ? error.message : 'Could not finish duel'
      phase.value = 'error'
      clearTimers()
      usingLocalBot = false
      if (mainSnapshot) {
        useGameStore().exitDuelMode(mainSnapshot)
        mainSnapshot = null
      }
    }
  }

  async function reportCurrentScore() {
    if (!match.value || phase.value !== 'active' || endingMatch) {
      return
    }
    const game = useGameStore()
    if (usingLocalBot) {
      match.value = {
        ...match.value,
        scoreA:
          match.value.playerA === profile.value?.id
            ? game.state.cookiesBakedAllTime
            : match.value.scoreA,
        scoreB:
          match.value.playerB === profile.value?.id
            ? game.state.cookiesBakedAllTime
            : match.value.scoreB,
      }
      if (isMatchExpired(match.value)) {
        await endActiveMatch()
      }
      return
    }
    const backend = getMultiplayerBackend()
    try {
      const updated = await backend.reportScore(match.value.id, game.state.cookiesBakedAllTime)
      match.value = updated
      updateCountdown()
      if (updated.status === 'settled') {
        await finishDuel(updated)
      } else if (isMatchExpired(updated)) {
        await endActiveMatch()
      }
    } catch {
      if (isMatchExpired(match.value)) {
        await endActiveMatch()
      }
    }
  }

  async function finishDuel(settled: DuelMatch) {
    if (phase.value === 'result') {
      endingMatch = false
      return
    }
    if (phase.value === 'idle') {
      endingMatch = false
      return
    }
    clearTimers()
    endingMatch = false
    usingLocalBot = false
    const game = useGameStore()
    const userId = profile.value?.id
    resultKind.value = resolveDuelResultKind(settled, userId)

    if (mainSnapshot) {
      const restored = applyDuelOutcome(mainSnapshot, resultKind.value)
      game.exitDuelMode(restored)
      mainSnapshot = null
    }

    match.value = settled
    phase.value = 'result'
    await syncProfileKills()
  }

  async function resumePendingDuel() {
    if (phase.value !== 'idle') {
      return
    }
    const backend = getMultiplayerBackend()
    if (backend.kind !== 'supabase') {
      return
    }
    try {
      profile.value = await backend.ensureAuth()
      const active = await backend.getActiveMatch()
      if (!active) {
        return
      }
      if (active.status === 'settled') {
        match.value = active
        await applySettledResult(active)
        return
      }
      await beginDuelSession(active)
    } catch {
      // ignore resume errors on boot
    }
  }

  async function applySettledResult(settled: DuelMatch) {
    if (phase.value === 'result') {
      return
    }
    const game = useGameStore()
    const userId = profile.value?.id
    resultKind.value = resolveDuelResultKind(settled, userId)
    game.applyPersistedDuelBuff(resultKind.value)
    match.value = settled
    phase.value = 'result'
    await syncProfileKills()
  }

  async function findMatch() {
    errorMessage.value = ''
    phase.value = 'searching'
    const backend = getMultiplayerBackend()
    const searchStartedAt = Date.now()
    const BOT_FALLBACK_MS = 10_000
    try {
      profile.value = await backend.ensureAuth()
      let found = await backend.joinQueue()
      if (found) {
        await beginDuelSession(found)
        return
      }

      searchPollTimer = window.setInterval(() => {
        void (async () => {
          try {
            found = await backend.joinQueue()
            if (found) {
              if (searchPollTimer !== undefined) {
                window.clearInterval(searchPollTimer)
                searchPollTimer = undefined
              }
              await beginDuelSession(found)
              return
            }
            // Solo online: after a short wait, duel a local bot so you can test alone.
            if (
              backend.kind === 'supabase' &&
              Date.now() - searchStartedAt >= BOT_FALLBACK_MS
            ) {
              if (searchPollTimer !== undefined) {
                window.clearInterval(searchPollTimer)
                searchPollTimer = undefined
              }
              try {
                await backend.leaveQueue()
              } catch {
                // ignore
              }
              const userId = profile.value?.id
              if (!userId) {
                return
              }
              const startedAt = Date.now()
              const botMatch: DuelMatch = {
                id: `local-bot-${startedAt}`,
                playerA: userId,
                playerB: BOT_USER_ID,
                startedAt,
                endsAt: startedAt + DUEL_DURATION_SECONDS * 1000,
                scoreA: 0,
                scoreB: 0,
                status: 'active',
                winnerId: null,
                rewardA: 0,
                rewardB: 0,
              }
              await beginDuelSession(botMatch, true)
            }
          } catch (error) {
            errorMessage.value = error instanceof Error ? error.message : 'Matchmaking failed'
            phase.value = 'error'
            clearTimers()
          }
        })()
      }, 1000)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Matchmaking failed'
      phase.value = 'error'
      clearTimers()
    }
  }

  async function cancelSearch() {
    clearTimers()
    try {
      await getMultiplayerBackend().leaveQueue()
    } catch {
      // ignore
    }
    phase.value = 'idle'
  }

  function dismissResult() {
    match.value = null
    resultKind.value = 'loss'
    errorMessage.value = ''
    phase.value = 'idle'
  }

  async function ensureProfile() {
    const backend = getMultiplayerBackend()
    profile.value = await backend.ensureAuth()
    return profile.value
  }

  async function saveDisplayName(raw: string) {
    const backend = getMultiplayerBackend()
    profile.value = await backend.updateDisplayName(raw)
    await refreshLeaderboard()
    return profile.value
  }

  function myScore() {
    if (!match.value || !profile.value) {
      return 0
    }
    return ownScore(match.value, profile.value.id)
  }

  function theirScore() {
    if (!match.value || !profile.value) {
      return 0
    }
    return opponentScore(match.value, profile.value.id)
  }

  return {
    phase,
    errorMessage,
    profile,
    match,
    leaderboard,
    resultKind,
    remainingSeconds,
    isDueling,
    canUseMetaActions,
    findMatch,
    cancelSearch,
    dismissResult,
    refreshLeaderboard,
    syncProfileKills,
    resumePendingDuel,
    ensureProfile,
    saveDisplayName,
    myScore,
    theirScore,
  }
})
