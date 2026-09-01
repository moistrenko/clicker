import { createInitialState } from '@/game/engine/state'
import type { GameState } from '@/game/types'

export const ASCEND_THRESHOLD = 1_000_000
/** Each Survivor Rank tier costs this many times more run kills than the previous one. */
export const RANK_COST_GROWTH = 8
/** +3% damage per rank, capped so late ascensions stay meaningful but not broken. */
export const PRESTIGE_BONUS_PER_RANK = 0.03
export const PRESTIGE_BONUS_CAP = 3

/** Run kills required to earn rank `currentRank` → `currentRank + 1`. */
export function killsRequiredForRank(currentRank: number): number {
  if (currentRank < 0) {
    return ASCEND_THRESHOLD
  }
  return ASCEND_THRESHOLD * RANK_COST_GROWTH ** currentRank
}

export function totalLifetimeKills(state: GameState): number {
  return (state.lifetimeKills ?? 0) + state.cookiesBakedAllTime
}

/** Survivor Rank earned if all lifetime kills were spent on rank tiers. */
export function rankFromKills(kills: number): number {
  let rank = 0
  let spent = 0
  while (spent + killsRequiredForRank(rank) <= kills) {
    spent += killsRequiredForRank(rank)
    rank += 1
  }
  return rank
}

export function prestigeMultiplier(state: GameState): number {
  const rank = state.prestigeLevel ?? 0
  const bonus = Math.min(rank * PRESTIGE_BONUS_PER_RANK, PRESTIGE_BONUS_CAP - 1)
  return 1 + bonus
}

export function projectAscendGain(state: GameState): number {
  const currentRank = state.prestigeLevel ?? 0
  let gain = 0
  let rank = currentRank
  let remaining = state.cookiesBakedAllTime

  while (remaining >= killsRequiredForRank(rank)) {
    remaining -= killsRequiredForRank(rank)
    rank += 1
    gain += 1
  }

  return gain
}

export function canAscend(state: GameState): boolean {
  return projectAscendGain(state) > 0
}

export function ascend(state: GameState): GameState {
  const gain = projectAscendGain(state)
  if (gain <= 0) {
    return state
  }

  const prestigeLevel = (state.prestigeLevel ?? 0) + gain
  const lifetimeKills = totalLifetimeKills(state)
  const fresh = createInitialState()

  return {
    ...fresh,
    prestigeLevel,
    lifetimeKills,
    achievements: [...(state.achievements ?? [])],
    duelWins: state.duelWins ?? 0,
    duelLosses: state.duelLosses ?? 0,
    duelDraws: state.duelDraws ?? 0,
    cookiesPerClick: prestigeMultiplier({ ...fresh, prestigeLevel, lifetimeKills }),
  }
}

/** Remap legacy sqrt-based prestige levels from older saves. */
export function migratePrestigeLevel(level: number): number {
  if (!Number.isFinite(level) || level <= 0) {
    return 0
  }
  if (level <= 500) {
    return Math.floor(level)
  }
  const migrated = Math.floor(15 + Math.log10(level + 1) * 8)
  return Math.min(migrated, 200)
}
