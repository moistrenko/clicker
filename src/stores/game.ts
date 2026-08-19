import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  buy,
  buyUpgrade,
  checkAchievements,
  click,
  clickGoldenCookie,
  createInitialState,
  getCookiesPerClick,
  listAchievements,
  listActiveBuffs,
  listStoreBuildings,
  listStoreUpgrades,
  tick,
  totalBuildingsOwned,
  totalCps,
} from '@/game/engine'
import { formatCookies } from '@/game/format/numbers'
import { createDebouncedSave, loadGame, saveGame } from '@/game/persist/storage'
import type { AchievementDef, BuildingId, GameState } from '@/game/types'

const TICK_MS = 50
const ACHIEVEMENT_TICK_INTERVAL_SECONDS = 5

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>(loadGame())
  const saver = createDebouncedSave((next) => saveGame(next))
  const recentAchievement = ref<AchievementDef | null>(null)
  const pendingAchievementToasts: AchievementDef[] = []

  let intervalId: number | undefined
  let lastTick = 0
  let achievementTickAccumulator = 0

  const cookies = computed(() => state.value.cookies)
  const cookiesBakedAllTime = computed(() => state.value.cookiesBakedAllTime)
  const cookiesPerClick = computed(() => getCookiesPerClick(state.value))
  const cps = computed(() => totalCps(state.value))
  const buildingsOwned = computed(() => totalBuildingsOwned(state.value))
  const storeListings = computed(() => listStoreBuildings(state.value))
  const upgradeListings = computed(() => listStoreUpgrades(state.value))
  const formattedCookies = computed(() => formatCookies(state.value.cookies))
  const formattedCps = computed(() => formatCookies(cps.value))
  const formattedBaked = computed(() => formatCookies(state.value.cookiesBakedAllTime))
  const goldenCookie = computed(() => state.value.goldenCookie)
  const activeBuffs = computed(() => listActiveBuffs(state.value))
  const achievementList = computed(() => listAchievements(state.value))

  function persist(next: GameState = state.value) {
    saver.schedule(next)
  }

  function flushSave() {
    saver.flush(state.value)
  }

  function pumpAchievementToast() {
    if (pendingAchievementToasts.length === 0) {
      recentAchievement.value = null
      return
    }
    recentAchievement.value = pendingAchievementToasts.shift() ?? null
  }

  function notifyAchievements(newlyUnlocked: AchievementDef[]) {
    if (newlyUnlocked.length === 0) {
      return
    }
    pendingAchievementToasts.push(...newlyUnlocked)
    if (recentAchievement.value === null) {
      pumpAchievementToast()
    }
  }

  function commit(next: GameState, checkAchievementsNow = true) {
    if (checkAchievementsNow) {
      const result = checkAchievements(next)
      state.value = result.state
      if (result.newlyUnlocked.length > 0) {
        notifyAchievements(result.newlyUnlocked)
      }
    } else {
      state.value = next
    }
    persist(state.value)
  }

  function clickCookie() {
    commit(click(state.value))
  }

  function collectGoldenCookie() {
    const before = state.value
    const next = clickGoldenCookie(before)
    if (next === before) {
      return
    }
    commit(next)
  }

  function buyBuilding(id: BuildingId) {
    const before = state.value
    const next = buy(before, id)
    if (next === before) {
      return false
    }
    commit(next)
    return true
  }

  function purchaseUpgrade(id: string) {
    const before = state.value
    const next = buyUpgrade(before, id)
    if (next === before) {
      return false
    }
    commit(next)
    return true
  }

  function applyTick(dtSeconds: number) {
    const next = tick(state.value, dtSeconds)
    if (next === state.value) {
      return
    }

    achievementTickAccumulator += dtSeconds
    const shouldCheckAchievements = achievementTickAccumulator >= ACHIEVEMENT_TICK_INTERVAL_SECONDS
    if (shouldCheckAchievements) {
      achievementTickAccumulator = 0
    }
    commit(next, shouldCheckAchievements)
  }

  function clearRecentAchievement() {
    recentAchievement.value = null
    pumpAchievementToast()
  }

  function start() {
    if (intervalId !== undefined) {
      return
    }
    lastTick = performance.now()
    window.addEventListener('beforeunload', flushSave)
    intervalId = window.setInterval(() => {
      const now = performance.now()
      const dtSeconds = (now - lastTick) / 1000
      lastTick = now
      applyTick(dtSeconds)
    }, TICK_MS)
  }

  function stop() {
    if (intervalId !== undefined) {
      window.clearInterval(intervalId)
      intervalId = undefined
    }
    window.removeEventListener('beforeunload', flushSave)
    flushSave()
  }

  function reset() {
    achievementTickAccumulator = 0
    pendingAchievementToasts.length = 0
    recentAchievement.value = null
    state.value = createInitialState()
    saver.flush(state.value)
  }

  return {
    state,
    cookies,
    cookiesBakedAllTime,
    cookiesPerClick,
    cps,
    buildingsOwned,
    storeListings,
    upgradeListings,
    formattedCookies,
    formattedCps,
    formattedBaked,
    goldenCookie,
    activeBuffs,
    achievementList,
    recentAchievement,
    clickCookie,
    collectGoldenCookie,
    buyBuilding,
    buyUpgrade: purchaseUpgrade,
    clearRecentAchievement,
    start,
    stop,
    reset,
  }
})
