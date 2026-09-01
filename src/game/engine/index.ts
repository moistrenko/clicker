import { BUILDINGS, getBuilding } from '@/game/catalog/buildings'
import { getUpgrade, UPGRADES } from '@/game/catalog/upgrades'
import type {
  BuildingId,
  GameState,
  StoreListing,
  UpgradeDef,
  UpgradeListing,
} from '@/game/types'
import {
  clickBuffMultiplier,
  cpsBuffMultipliers,
  ensureGoldenSpawnScheduled,
  expireBuffs,
  updateGoldenCookieSpawn,
} from '@/game/engine/goldenCookie'
import { prestigeMultiplier } from '@/game/engine/prestige'
import {
  ensureWorldEventScheduled,
  eventClickMultiplier,
  eventCpsMultiplier,
  eventEliteSpawnBoost,
  updateWorldEvents,
} from '@/game/engine/events'

export {
  ascend,
  ASCEND_THRESHOLD,
  canAscend,
  killsRequiredForRank,
  migratePrestigeLevel,
  normalizePrestigeLevel,
  PRESTIGE_BONUS_CAP,
  PRESTIGE_BONUS_PER_RANK,
  prestigeMultiplier,
  projectAscendGain,
  rankFromKills,
  RANK_COST_GROWTH,
  totalLifetimeKills,
} from '@/game/engine/prestige'
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
/** After this many owned, price exponent grows linearly instead of 1.15^n (keeps late game buyable). */
export const PRICE_EXP_LINEAR_START = 100
export const PRICE_EXP_LINEAR_RATE = 0.15
export const ALWAYS_VISIBLE_BUILDINGS = 3
export const REVEAL_THRESHOLD = 0.5
export const MAX_TICK_SECONDS = 30

export { createInitialState, emptyBuildings } from '@/game/engine/state'

export function buildingPriceExponent(owned: number): number {
  if (owned <= PRICE_EXP_LINEAR_START) {
    return owned
  }
  return PRICE_EXP_LINEAR_START + (owned - PRICE_EXP_LINEAR_START) * PRICE_EXP_LINEAR_RATE
}

export function buildingPrice(baseCost: number, owned: number): number {
  return Math.ceil(baseCost * Math.pow(PRICE_GROWTH, buildingPriceExponent(owned)))
}

export function bulkBuildingPrice(baseCost: number, owned: number, count: number): number {
  if (!(count > 0)) {
    return 0
  }
  let total = 0
  for (let i = 0; i < count; i += 1) {
    total += buildingPrice(baseCost, owned + i)
  }
  return total
}

const MAX_AFFORDABLE_BUILDINGS = 10_000

export function maxAffordableBuildingCount(
  baseCost: number,
  owned: number,
  budget: number,
): number {
  if (!(budget > 0)) {
    return 0
  }
  let count = 0
  let remaining = budget
  while (count < MAX_AFFORDABLE_BUILDINGS) {
    const price = buildingPrice(baseCost, owned + count)
    if (remaining < price) {
      break
    }
    remaining -= price
    count += 1
  }
  return count
}

export function currentPrice(state: GameState, id: BuildingId): number {
  const building = getBuilding(id)
  const owned = state.buildings[id] ?? 0
  return buildingPrice(building.baseCost, owned)
}

export function currentBulkPrice(state: GameState, id: BuildingId, count: number): number {
  const building = getBuilding(id)
  const owned = state.buildings[id] ?? 0
  return bulkBuildingPrice(building.baseCost, owned, count)
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

export function buildingCpsEach(state: GameState, buildingId: BuildingId, atTime = state.gameTime): number {
  const building = getBuilding(buildingId)
  const { frenzy, building: buildingBuffs } = cpsBuffMultipliers(state, atTime)
  const specialMult = buildingBuffs.get(buildingId) ?? 1
  return (
    building.baseCps *
    buildingMultiplier(state, buildingId) *
    specialMult *
    frenzy *
    prestigeMultiplier(state)
  )
}

export function buildingCpsTotal(state: GameState, buildingId: BuildingId, atTime = state.gameTime): number {
  const owned = state.buildings[buildingId] ?? 0
  return owned * buildingCpsEach(state, buildingId, atTime)
}

export function upgradeCpsGain(state: GameState, upgrade: UpgradeDef, atTime = state.gameTime): number {
  if (upgrade.type !== 'double') {
    return 0
  }
  return buildingCpsTotal(state, upgrade.buildingId, atTime)
}

export function upgradeClickGain(state: GameState, upgrade: UpgradeDef, atTime = state.gameTime): number {
  if (!upgrade.alsoBoostClick) {
    return 0
  }
  return getCookiesPerClick(state, atTime)
}

export function getCookiesPerClick(state: GameState, atTime = state.gameTime): number {
  let amount = 1
  for (const id of state.upgrades ?? []) {
    const upgrade = getUpgrade(id)
    if (upgrade?.alsoBoostClick) {
      amount *= 2
    }
  }
  return amount * clickBuffMultiplier(state, atTime) * prestigeMultiplier(state) * eventClickMultiplier(state, atTime)
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
  return cps * frenzy * prestigeMultiplier(state) * eventCpsMultiplier(state, atTime)
}

export function canBuy(state: GameState, id: BuildingId, count = 1): boolean {
  return state.cookies >= currentBulkPrice(state, id, count)
}

export function buy(state: GameState, id: BuildingId, count = 1): GameState {
  if (!(count > 0)) {
    return state
  }
  const building = getBuilding(id)
  const owned = state.buildings[id] ?? 0
  const price = bulkBuildingPrice(building.baseCost, owned, count)
  if (state.cookies < price) {
    return state
  }

  return {
    ...state,
    cookies: state.cookies - price,
    buildings: {
      ...state.buildings,
      [id]: owned + count,
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
      cpsGain: upgradeCpsGain(state, upgrade),
      clickGain: upgradeClickGain(state, upgrade),
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
  next = updateWorldEvents(next, rng)
  const eliteScale = 1 - eventEliteSpawnBoost(next)
  next = updateGoldenCookieSpawn(next, rng, eliteScale)

  const gained = totalCps(next) * elapsed
  if (gained > 0) {
    next = {
      ...next,
      cookies: next.cookies + gained,
      cookiesBakedAllTime: next.cookiesBakedAllTime + gained,
    }
    next = ensureGoldenSpawnScheduled(next, rng, eliteScale)
    next = ensureWorldEventScheduled(next, rng)
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
      const cpsEach = buildingCpsEach(state, building.id)
      listings.push({
        building,
        owned,
        price,
        affordable: state.cookies >= price,
        locked: false,
        cpsEach,
        cpsTotal: owned * cpsEach,
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
        cpsEach: 0,
        cpsTotal: 0,
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

export { listActiveWorldEvents, triggerWorldEvent } from '@/game/engine/events'
