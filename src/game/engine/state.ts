import { BUILDINGS } from '@/game/catalog/buildings'
import type { BuildingCounts, GameState } from '@/game/types'
import { SAVE_VERSION } from '@/game/types'

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
    prestigeLevel: 0,
    lifetimeKills: 0,
    lastSavedAt: 0,
  }
}
