import { BUILDINGS, getBuilding } from '@/game/catalog/buildings'
import { getUpgrade, UPGRADES } from '@/game/catalog/upgrades'
import type {
  BuildingCounts,
  BuildingId,
  GameState,
  StoreListing,
  UpgradeDef,
  UpgradeListing,
} from '@/game/types'
import { SAVE_VERSION } from '@/game/types'
import {
  clickBuffMultiplier,
  cpsBuffMultipliers,
  ensureGoldenSpawnScheduled,
  expireBuffs,
  updateGoldenCookieSpawn,
} from '@/game/engine/goldenCookie'

export {
  clickGoldenCookie,
  ensureGoldenSpawnScheduled,
  expireBuffs,
  getActiveBuffs,
  listActiveBuffs,
  luckyBonus,
  nextGoldenSpawnInterval,
  randomGoldenPosition,
  resetBuffIdCounter,
  updateGoldenCookieSpawn,
} from '@/game/engine/goldenCookie'
export type { Rng } from '@/game/engine/goldenCookie'

export const PRICE_GROWTH = 1.15
export const ALWAYS_VISIBLE_BUILDINGS = 3
export const REVEAL_THRESHOLD = 0.5
export const MAX_TICK_SECONDS = 30

export function emptyBuildings(): BuildingCounts {
  const buildings = {} as BuildingCounts
  for (const building of BUILDINGS) {
    buildings[building.id] = 0
  }
  return buildings
}

export function createInitialState(): GameState {
  return {
    version: SAVE_VERSION,
    cookies: 0,
    cookiesBakedAllTime: 0,
    cookiesPerClick: 1,
    totalClicks: 0,
    buildings: emptyBuildings(),
    upgrades: [],
    achievements: [],
    gameTime: 0,
    activeBuffs: [],
    goldenCookie: null,
    nextGoldenSpawnAt: null,
  }
}

export function buildingPrice(baseCost: number, owned: number): number {
  return Math.ceil(baseCost * Math.pow(PRICE_GROWTH, owned))
}

export function currentPrice(state: GameState, id: BuildingId): number {
  const building = getBuilding(id)
  const owned = state.buildings[id] ?? 0
  return buildingPrice(building.baseCost, owned)
}

export function buildingMultiplier(state: GameState, buildingId: BuildingId): number {
  let doubles = 0
  for (const id of state.upgrades ?? []) {
    const upgrade = getUpgrade(id)
    if (upgrade?.buildingId === buildingId && upgrade.type === 'double') {
      doubles += 1
    }
  }
  return 2 ** doubles
}

export function getCookiesPerClick(state: GameState, atTime = state.gameTime): number {
  let amount = 1
  for (const id of state.upgrades ?? []) {
    const upgrade = getUpgrade(id)
    if (upgrade?.alsoBoostClick) {
      amount *= 2
    }
  }
  return amount * clickBuffMultiplier(state, atTime)
}

export function click(state: GameState): GameState {
  const amount = getCookiesPerClick(state)
  const next = {
    ...state,
    cookies: state.cookies + amount,
    cookiesBakedAllTime: state.cookiesBakedAllTime + amount,
    cookiesPerClick: amount,
    totalClicks: (state.totalClicks ?? 0) + 1,
  }
  return ensureGoldenSpawnScheduled(next)
}

export function totalCps(state: GameState, atTime = state.gameTime): number {
  const { frenzy, building: buildingBuffs } = cpsBuffMultipliers(state, atTime)
  let cps = 0
  for (const building of BUILDINGS) {
    const owned = state.buildings[building.id] ?? 0
    const specialMult = buildingBuffs.get(building.id) ?? 1
    cps += owned * building.baseCps * buildingMultiplier(state, building.id) * specialMult
  }
  return cps * frenzy
}

export function canBuy(state: GameState, id: BuildingId): boolean {
  return state.cookies >= currentPrice(state, id)
}

export function buy(state: GameState, id: BuildingId): GameState {
  const price = currentPrice(state, id)
  if (state.cookies < price) {
    return state
  }

  const owned = state.buildings[id] ?? 0
  return {
    ...state,
    cookies: state.cookies - price,
    buildings: {
      ...state.buildings,
      [id]: owned + 1,
    },
  }
}

export function isUpgradeUnlocked(state: GameState, upgrade: UpgradeDef): boolean {
  return (state.buildings[upgrade.buildingId] ?? 0) >= upgrade.unlockOwned
}

export function isUpgradeOwned(state: GameState, id: string): boolean {
  return (state.upgrades ?? []).includes(id)
}

export function canBuyUpgrade(state: GameState, id: string): boolean {
  const upgrade = getUpgrade(id)
  if (!upgrade || isUpgradeOwned(state, id) || !isUpgradeUnlocked(state, upgrade)) {
    return false
  }
  return state.cookies >= upgrade.cost
}

export function buyUpgrade(state: GameState, id: string): GameState {
  const upgrade = getUpgrade(id)
  if (!upgrade || isUpgradeOwned(state, id) || !isUpgradeUnlocked(state, upgrade)) {
    return state
  }
  if (state.cookies < upgrade.cost) {
    return state
  }

  const next: GameState = {
    ...state,
    cookies: state.cookies - upgrade.cost,
    upgrades: [...(state.upgrades ?? []), upgrade.id],
  }
  next.cookiesPerClick = getCookiesPerClick(next)
  return next
}

export function listStoreUpgrades(state: GameState): UpgradeListing[] {
  const owned = new Set(state.upgrades ?? [])
  const listings: UpgradeListing[] = []

  for (const upgrade of UPGRADES) {
    if (owned.has(upgrade.id) || !isUpgradeUnlocked(state, upgrade)) {
      continue
    }
    listings.push({
      upgrade,
      affordable: state.cookies >= upgrade.cost,
    })
  }

  listings.sort((a, b) => a.upgrade.cost - b.upgrade.cost)
  return listings
}

export function tick(state: GameState, dtSeconds: number, rng: () => number = Math.random): GameState {
  if (!(dtSeconds > 0)) {
    return state
  }

  const elapsed = Math.min(dtSeconds, MAX_TICK_SECONDS)
  let next: GameState = {
    ...state,
    gameTime: state.gameTime + elapsed,
  }
  next = expireBuffs(next)
  next = updateGoldenCookieSpawn(next, rng)

  const gained = totalCps(next) * elapsed
  if (gained > 0) {
    next = {
      ...next,
      cookies: next.cookies + gained,
      cookiesBakedAllTime: next.cookiesBakedAllTime + gained,
    }
    next = ensureGoldenSpawnScheduled(next, rng)
  }

  return next
}

export function isBuildingNamed(allTimeCookies: number, index: number, baseCost: number): boolean {
  if (index < ALWAYS_VISIBLE_BUILDINGS) {
    return true
  }
  return allTimeCookies >= baseCost * REVEAL_THRESHOLD
}

export function listStoreBuildings(state: GameState): StoreListing[] {
  const listings: StoreListing[] = []
  let shownMystery = false

  for (let index = 0; index < BUILDINGS.length; index += 1) {
    const building = BUILDINGS[index]
    if (!building) {
      continue
    }

    const named = isBuildingNamed(state.cookiesBakedAllTime, index, building.baseCost)
    if (named) {
      const owned = state.buildings[building.id] ?? 0
      const price = buildingPrice(building.baseCost, owned)
      listings.push({
        building,
        owned,
        price,
        affordable: state.cookies >= price,
        locked: false,
      })
      continue
    }

    if (!shownMystery) {
      shownMystery = true
      listings.push({
        building,
        owned: 0,
        price: 0,
        affordable: false,
        locked: true,
      })
    }
  }

  return listings
}

export function totalBuildingsOwned(state: GameState): number {
  let owned = 0
  for (const building of BUILDINGS) {
    owned += state.buildings[building.id] ?? 0
  }
  return owned
}

export {
  checkAchievements,
  listAchievements,
  parseAchievements,
} from '@/game/engine/achievements'
