import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  buy,
  buyUpgrade,
  canAscend,
  checkAchievements,
  click,
  clickGoldenCookie,
  createInitialState,
  getCookiesPerClick,
  listAchievements,
  listActiveBuffs,
  listStoreBuildings,
  listStoreUpgrades,
  prestigeMultiplier,
  projectAscendGain,
  ascend as ascendState,
  tick,
  totalBuildingsOwned,
  totalCps,
} from '@/game/engine'
import { formatCookies, formatCookiesParts } from '@/game/format/numbers'
import { i18n, numberLocaleForApp, type AppLocale } from '@/i18n'
import { createDebouncedSave, loadGame, parseSave, saveGame } from '@/game/persist/storage'
import type { AchievementDef, BuildingId, GameState } from '@/game/types'

const TICK_MS = 50
const ACHIEVEMENT_TICK_INTERVAL_SECONDS = 5

function scaleNamesFromI18n() {
  const t = i18n.global.t
  return {
    million: t('numbers.million'),
    billion: t('numbers.billion'),
    trillion: t('numbers.trillion'),
    quadrillion: t('numbers.quadrillion'),
    quintillion: t('numbers.quintillion'),
    sextillion: t('numbers.sextillion'),
    septillion: t('numbers.septillion'),
    octillion: t('numbers.octillion'),
    nonillion: t('numbers.nonillion'),
    decillion: t('numbers.decillion'),
  }
}

function formatOptions() {
  return {
    locale: numberLocaleForApp(i18n.global.locale.value as AppLocale),
    scaleNames: scaleNamesFromI18n(),
  }
}

export const useGameStore = defineStore('game', () => {
  const loadResult = loadGame()
  const state = ref<GameState>(loadResult.state)
  const offlineKills = ref(loadResult.offlineKills)
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
  const cookiesDisplay = computed(() => formatCookiesParts(state.value.cookies, formatOptions()))
  const formattedCookies = computed(() => formatCookies(state.value.cookies, formatOptions()))
  const formattedCps = computed(() => formatCookies(cps.value, formatOptions()))
  const formattedBaked = computed(() => formatCookies(state.value.cookiesBakedAllTime, formatOptions()))
  const goldenCookie = computed(() => state.value.goldenCookie)
  const activeBuffs = computed(() => listActiveBuffs(state.value))
  const achievementList = computed(() => listAchievements(state.value))
  const prestigeLevel = computed(() => state.value.prestigeLevel ?? 0)
  const prestigeBonus = computed(() => prestigeMultiplier(state.value))
  const ascendGain = computed(() => projectAscendGain(state.value))
  const canAscendNow = computed(() => canAscend(state.value))

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

  function buyBuilding(id: BuildingId, count = 1) {
    const before = state.value
    const next = buy(before, id, count)
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

  function ascend() {
    const before = state.value
    const next = ascendState(before)
    if (next === before) {
      return false
    }
    achievementTickAccumulator = 0
    commit(next, false)
    return true
  }

  function clearOfflineBanner() {
    offlineKills.value = 0
  }

  async function exportSaveToClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state.value))
      return true
    } catch {
      return false
    }
  }

  function importSave(raw: string): boolean {
    const parsed = parseSave(raw)
    if (!parsed) {
      return false
    }
    achievementTickAccumulator = 0
    pendingAchievementToasts.length = 0
    recentAchievement.value = null
    offlineKills.value = 0
    state.value = { ...parsed, lastSavedAt: Date.now() }
    saver.flush(state.value)
    return true
  }

  function wipeSave() {
    reset()
  }

  function reset() {
    achievementTickAccumulator = 0
    pendingAchievementToasts.length = 0
    recentAchievement.value = null
    offlineKills.value = 0
    state.value = createInitialState()
    saver.flush(state.value)
  }

  return {
    state,
    offlineKills,
    cookies,
    cookiesBakedAllTime,
    cookiesPerClick,
    cps,
    buildingsOwned,
    storeListings,
    upgradeListings,
    cookiesDisplay,
    formattedCookies,
    formattedCps,
    formattedBaked,
    goldenCookie,
    activeBuffs,
    achievementList,
    prestigeLevel,
    prestigeBonus,
    ascendGain,
    canAscendNow,
    recentAchievement,
    clickCookie,
    collectGoldenCookie,
    buyBuilding,
    buyUpgrade: purchaseUpgrade,
    clearRecentAchievement,
    ascend,
    start,
    stop,
    reset,
    wipeSave,
    exportSaveToClipboard,
    importSave,
    clearOfflineBanner,
  }
})
