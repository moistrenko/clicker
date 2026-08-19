import { ACHIEVEMENTS, getAchievement } from '@/game/catalog/achievements'
import { BUILDINGS } from '@/game/catalog/buildings'
import { getUpgrade } from '@/game/catalog/upgrades'
import { cpsBuffMultipliers } from '@/game/engine/goldenCookie'
import type { AchievementDef, AchievementListing, BuildingId, GameState } from '@/game/types'

function buildingMultiplier(state: GameState, buildingId: BuildingId): number {
  let doubles = 0
  for (const id of state.upgrades ?? []) {
    const upgrade = getUpgrade(id)
    if (upgrade?.buildingId === buildingId && upgrade.type === 'double') {
      doubles += 1
    }
  }
  return 2 ** doubles
}

function countTotalBuildings(state: GameState): number {
  let owned = 0
  for (const building of BUILDINGS) {
    owned += state.buildings[building.id] ?? 0
  }
  return owned
}

function stateCps(state: GameState): number {
  const { frenzy, building: buildingBuffs } = cpsBuffMultipliers(state)
  let cps = 0
  for (const building of BUILDINGS) {
    const owned = state.buildings[building.id] ?? 0
    const specialMult = buildingBuffs.get(building.id) ?? 1
    cps += owned * building.baseCps * buildingMultiplier(state, building.id) * specialMult
  }
  return cps * frenzy
}

function isConditionMet(state: GameState, condition: AchievementDef['condition']): boolean {
  switch (condition.type) {
    case 'totalKills':
      return state.cookiesBakedAllTime >= condition.threshold
    case 'clicks':
      return (state.totalClicks ?? 0) >= condition.threshold
    case 'buildingOwned':
      return (state.buildings[condition.buildingId] ?? 0) >= condition.count
    case 'totalBuildings':
      return countTotalBuildings(state) >= condition.threshold
    case 'cps':
      return stateCps(state) >= condition.threshold
    case 'upgradesOwned':
      return (state.upgrades ?? []).length >= condition.threshold
    default:
      return false
  }
}

export function checkAchievements(state: GameState): {
  state: GameState
  newlyUnlocked: AchievementDef[]
} {
  const unlocked = new Set(state.achievements ?? [])
  const newlyUnlocked: AchievementDef[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) {
      continue
    }
    if (!isConditionMet(state, achievement.condition)) {
      continue
    }
    unlocked.add(achievement.id)
    newlyUnlocked.push(achievement)
  }

  if (newlyUnlocked.length === 0) {
    return { state, newlyUnlocked }
  }

  return {
    state: {
      ...state,
      achievements: [...unlocked],
    },
    newlyUnlocked,
  }
}

export function listAchievements(state: GameState): AchievementListing[] {
  const unlocked = new Set(state.achievements ?? [])
  return ACHIEVEMENTS.map((achievement) => ({
    achievement,
    unlocked: unlocked.has(achievement.id),
  }))
}

export function parseAchievements(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const ids: string[] = []
  const seen = new Set<string>()
  for (const id of value) {
    if (typeof id !== 'string' || seen.has(id) || !getAchievement(id)) {
      continue
    }
    seen.add(id)
    ids.push(id)
  }
  return ids
}
