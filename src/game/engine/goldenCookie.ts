import { BUILDINGS, getBuilding } from '@/game/catalog/buildings'
import { DUEL_SPOILS_MULTIPLIER } from '@/game/catalog/duelSpoils'
import {
  BUFF_META,
  BUILDING_SPECIAL_DURATION_SECONDS,
  BUILDING_SPECIAL_MULTIPLIER,
  CLICK_FRENZY_DURATION_SECONDS,
  CLICK_FRENZY_MULTIPLIER,
  FRENZY_DURATION_SECONDS,
  FRENZY_MULTIPLIER,
  GOLDEN_COOKIE_EFFECTS,
  GOLDEN_COOKIE_MIN_BAKED,
  GOLDEN_SPAWN_JITTER_MAX,
  GOLDEN_SPAWN_JITTER_MIN,
  GOLDEN_SPAWN_MEAN_SECONDS,
  LUCKY_BANK_RATIO,
  LUCKY_MAX_BONUS,
  LUCKY_MIN_BONUS,
} from '@/game/catalog/goldenCookies'
import type { ActiveBuff, BuffListing, BuffType, BuildingId, GameState } from '@/game/types'

export type Rng = () => number

let buffIdCounter = 0

export function resetBuffIdCounter(): void {
  buffIdCounter = 0
}

function nextBuffId(): string {
  buffIdCounter += 1
  return `buff-${buffIdCounter}`
}

export function nextGoldenSpawnInterval(rng: Rng = Math.random, intervalScale = 1): number {
  const jitter =
    GOLDEN_SPAWN_JITTER_MIN +
    rng() * (GOLDEN_SPAWN_JITTER_MAX - GOLDEN_SPAWN_JITTER_MIN)
  const scale = Math.min(1, Math.max(0.2, intervalScale))
  return GOLDEN_SPAWN_MEAN_SECONDS * jitter * scale
}

export function randomGoldenPosition(rng: Rng = Math.random): { x: number; y: number } {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const x = 0.08 + rng() * 0.84
    const y = 0.08 + rng() * 0.84
    const dx = x - 0.5
    const dy = y - 0.5
    if (dx * dx + dy * dy >= 0.12 * 0.12) {
      return { x, y }
    }
  }
  return { x: 0.14, y: 0.18 }
}

export function getActiveBuffs(state: GameState, atTime = state.gameTime): ActiveBuff[] {
  return (state.activeBuffs ?? []).filter((buff) => buff.expiresAt > atTime)
}

export function expireBuffs(state: GameState): GameState {
  const activeBuffs = getActiveBuffs(state)
  if (activeBuffs.length === (state.activeBuffs ?? []).length) {
    return state
  }
  return { ...state, activeBuffs }
}

export function listActiveBuffs(state: GameState, atTime = state.gameTime): BuffListing[] {
  return getActiveBuffs(state, atTime)
    .filter((buff) => buff.type !== 'lucky')
    .map((buff) => {
      const meta = BUFF_META[buff.type]
      let description = meta.description
      if (buff.type === 'buildingSpecial' && buff.buildingId) {
        const building = getBuilding(buff.buildingId)
        description = `${building.name} production ×${buff.multiplier ?? BUILDING_SPECIAL_MULTIPLIER}`
      }
      return {
        id: buff.id,
        type: buff.type,
        name: meta.name,
        description,
        remainingSeconds: Math.max(0, buff.expiresAt - atTime),
        buildingId: buff.buildingId,
        multiplier: buff.multiplier,
      }
    })
    .sort((a, b) => a.remainingSeconds - b.remainingSeconds)
}

function ownedBuildingIds(state: GameState): BuildingId[] {
  const owned: BuildingId[] = []
  for (const building of BUILDINGS) {
    if ((state.buildings[building.id] ?? 0) > 0) {
      owned.push(building.id)
    }
  }
  return owned
}

function pickWeightedEffect(rng: Rng): BuffType {
  const totalWeight = GOLDEN_COOKIE_EFFECTS.reduce((sum, effect) => sum + effect.weight, 0)
  let roll = rng() * totalWeight
  for (const effect of GOLDEN_COOKIE_EFFECTS) {
    roll -= effect.weight
    if (roll <= 0) {
      return effect.type
    }
  }
  return GOLDEN_COOKIE_EFFECTS[0]?.type ?? 'frenzy'
}

function pickGoldenEffect(state: GameState, rng: Rng): BuffType {
  let effect = pickWeightedEffect(rng)
  if (effect === 'buildingSpecial' && ownedBuildingIds(state).length === 0) {
    effect = 'frenzy'
  }
  return effect
}

function pickOwnedBuilding(state: GameState, rng: Rng): BuildingId {
  const owned = ownedBuildingIds(state)
  const index = Math.floor(rng() * owned.length)
  return owned[index] ?? 'cursor'
}

export function luckyBonus(cookies: number): number {
  const raw = Math.max(LUCKY_MIN_BONUS, Math.floor(cookies * LUCKY_BANK_RATIO))
  return Math.min(raw, LUCKY_MAX_BONUS)
}

function createBuff(
  type: BuffType,
  gameTime: number,
  rng: Rng,
  state: GameState,
): { buff?: ActiveBuff; instantCookies?: number } {
  const id = nextBuffId()
  switch (type) {
    case 'frenzy':
      return {
        buff: {
          id,
          type,
          multiplier: FRENZY_MULTIPLIER,
          expiresAt: gameTime + FRENZY_DURATION_SECONDS,
        },
      }
    case 'clickFrenzy':
      return {
        buff: {
          id,
          type,
          multiplier: CLICK_FRENZY_MULTIPLIER,
          expiresAt: gameTime + CLICK_FRENZY_DURATION_SECONDS,
        },
      }
    case 'buildingSpecial': {
      const buildingId = pickOwnedBuilding(state, rng)
      return {
        buff: {
          id,
          type,
          buildingId,
          multiplier: BUILDING_SPECIAL_MULTIPLIER,
          expiresAt: gameTime + BUILDING_SPECIAL_DURATION_SECONDS,
        },
      }
    }
    case 'lucky':
      return { instantCookies: luckyBonus(state.cookies) }
    default:
      return {}
  }
}

export function ensureGoldenSpawnScheduled(
  state: GameState,
  rng: Rng = Math.random,
  intervalScale = 1,
): GameState {
  if (state.cookiesBakedAllTime < GOLDEN_COOKIE_MIN_BAKED) {
    return state
  }
  if (state.goldenCookie !== null || state.nextGoldenSpawnAt !== null) {
    return state
  }
  return {
    ...state,
    nextGoldenSpawnAt: state.gameTime + nextGoldenSpawnInterval(rng, intervalScale),
  }
}

export function updateGoldenCookieSpawn(
  state: GameState,
  rng: Rng = Math.random,
  intervalScale = 1,
): GameState {
  const next = ensureGoldenSpawnScheduled(state, rng, intervalScale)
  if (next.goldenCookie !== null) {
    return next
  }
  if (next.nextGoldenSpawnAt === null || next.gameTime < next.nextGoldenSpawnAt) {
    return next
  }
  return {
    ...next,
    goldenCookie: randomGoldenPosition(rng),
    nextGoldenSpawnAt: null,
  }
}

export function clickGoldenCookie(state: GameState, rng: Rng = Math.random): GameState {
  if (!state.goldenCookie) {
    return state
  }

  const effect = pickGoldenEffect(state, rng)
  const { buff, instantCookies } = createBuff(effect, state.gameTime, rng, state)
  const activeBuffs = buff ? [...getActiveBuffs(state), buff] : getActiveBuffs(state)
  const cookieGain = instantCookies ?? 0

  return {
    ...state,
    cookies: state.cookies + cookieGain,
    cookiesBakedAllTime: state.cookiesBakedAllTime + cookieGain,
    activeBuffs,
    goldenCookie: null,
    nextGoldenSpawnAt: state.gameTime + nextGoldenSpawnInterval(rng),
  }
}

export function cpsBuffMultipliers(
  state: GameState,
  atTime = state.gameTime,
): { frenzy: number; building: Map<BuildingId, number> } {
  const frenzy = { value: 1 }
  const building = new Map<BuildingId, number>()

  for (const buff of getActiveBuffs(state, atTime)) {
    if (buff.type === 'frenzy' || buff.type === 'duelSpoils') {
      const fallback =
        buff.type === 'duelSpoils' ? DUEL_SPOILS_MULTIPLIER : FRENZY_MULTIPLIER
      frenzy.value *= buff.multiplier ?? fallback
    }
    if (buff.type === 'buildingSpecial' && buff.buildingId) {
      const current = building.get(buff.buildingId) ?? 1
      building.set(buff.buildingId, current * (buff.multiplier ?? BUILDING_SPECIAL_MULTIPLIER))
    }
  }

  return { frenzy: frenzy.value, building }
}

export function clickBuffMultiplier(state: GameState, atTime = state.gameTime): number {
  let multiplier = 1
  for (const buff of getActiveBuffs(state, atTime)) {
    if (buff.type === 'clickFrenzy') {
      multiplier *= buff.multiplier ?? CLICK_FRENZY_MULTIPLIER
    }
  }
  return multiplier
}
