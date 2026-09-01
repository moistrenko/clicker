import { createInitialState } from '@/game/engine/state'
import type { GameState } from '@/game/types'

export const ASCEND_THRESHOLD = 1_000_000
/** Each Survivor Rank tier costs this many times more run kills than the previous one. */
export const RANK_COST_GROWTH = 5
/** Ascend kill cost stops growing after this rank tier. */
export const RANK_COST_SOFT_CAP = 22
/** Maximum ranks earnable from a single run (prevents one huge run from jumping hundreds of ranks). */
export const MAX_ASCEND_GAIN_PER_RUN = 5
/** +3% damage per rank, capped so late ascensions stay meaningful but not broken. */
export const PRESTIGE_BONUS_PER_RANK = 0.03
export const PRESTIGE_BONUS_CAP = 3

/** Run kills required to ascend from `currentRank` → `currentRank + 1`. */
export function killsRequiredForRank(currentRank: number): number {
  const tier = Math.min(Math.max(0, currentRank), RANK_COST_SOFT_CAP)
  return ASCEND_THRESHOLD * RANK_COST_GROWTH ** tier
}

export function totalLifetimeKills(state: GameState): number {
  return (state.lifetimeKills ?? 0) + state.cookiesBakedAllTime
}

/** Survivor Rank implied by lifetime kills (escalating tier curve). */
export function rankFromKills(kills: number): number {
  if (!Number.isFinite(kills) || kills < ASCEND_THRESHOLD) {
    return 0
  }
  const ratio = (kills * (RANK_COST_GROWTH - 1)) / ASCEND_THRESHOLD + 1
  if (ratio <= 1) {
    return 0
  }
  return Math.floor(Math.log(ratio) / Math.log(RANK_COST_GROWTH))
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
    const cost = killsRequiredForRank(rank)
    if (rank >= RANK_COST_SOFT_CAP) {
      gain += Math.floor(remaining / cost)
      break
    }
    remaining -= cost
    rank += 1
    gain += 1
  }

  return Math.min(gain, MAX_ASCEND_GAIN_PER_RUN)
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

/**
 * Clamp prestige that is far above what lifetime kills could ever earn
 * (e.g. broken v8 sqrt migration giving rank 136 while SR from kills is ~44).
 */
export function normalizePrestigeLevel(prestigeLevel: number, lifetimeKills: number): number {
  const level = migratePrestigeLevel(prestigeLevel)
  const earned = rankFromKills(lifetimeKills)
  if (level > 500 || level > earned + 10) {
    return earned
  }
  return level
}
