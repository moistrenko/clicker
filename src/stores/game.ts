import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  buy,
  buyUpgrade,
  click,
  createInitialState,
  getCookiesPerClick,
  listStoreBuildings,
  listStoreUpgrades,
  tick,
  totalBuildingsOwned,
  totalCps,
} from '@/game/engine'
import { formatCookies } from '@/game/format/numbers'
import { createDebouncedSave, loadGame, saveGame } from '@/game/persist/storage'
import type { BuildingId, GameState } from '@/game/types'

const TICK_MS = 50

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>(loadGame())
  const saver = createDebouncedSave((next) => saveGame(next))

  let intervalId: number | undefined
  let lastTick = 0

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

  function persist(next: GameState = state.value) {
    saver.schedule(next)
  }

  function flushSave() {
    saver.flush(state.value)
  }

  function clickCookie() {
    state.value = click(state.value)
    persist()
  }

  function buyBuilding(id: BuildingId) {
    const before = state.value
    const next = buy(before, id)
    if (next === before) {
      return false
    }
    state.value = next
    persist()
    return true
  }

  function purchaseUpgrade(id: string) {
    const before = state.value
    const next = buyUpgrade(before, id)
    if (next === before) {
      return false
    }
    state.value = next
    persist()
    return true
  }

  function applyTick(dtSeconds: number) {
    const next = tick(state.value, dtSeconds)
    if (next !== state.value) {
      state.value = next
      persist()
    }
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
    clickCookie,
    buyBuilding,
    buyUpgrade: purchaseUpgrade,
    start,
    stop,
    reset,
  }
})
