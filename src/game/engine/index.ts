import { BUILDINGS, getBuilding } from '@/game/catalog/buildings'
import type { BuildingCounts, BuildingId, GameState, StoreListing } from '@/game/types'
import { SAVE_VERSION } from '@/game/types'

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
    buildings: emptyBuildings(),
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

export function click(state: GameState): GameState {
  const amount = state.cookiesPerClick
  return {
    ...state,
    cookies: state.cookies + amount,
    cookiesBakedAllTime: state.cookiesBakedAllTime + amount,
  }
}

export function totalCps(state: GameState): number {
  let cps = 0
  for (const building of BUILDINGS) {
    const owned = state.buildings[building.id] ?? 0
    cps += owned * building.baseCps
  }
  return cps
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

export function tick(state: GameState, dtSeconds: number): GameState {
  if (!(dtSeconds > 0)) {
    return state
  }

  const elapsed = Math.min(dtSeconds, MAX_TICK_SECONDS)
  const gained = totalCps(state) * elapsed
  if (gained === 0) {
    return state
  }

  return {
    ...state,
    cookies: state.cookies + gained,
    cookiesBakedAllTime: state.cookiesBakedAllTime + gained,
  }
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
