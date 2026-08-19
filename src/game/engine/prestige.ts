import { createInitialState } from '@/game/engine/state'
import type { GameState } from '@/game/types'

export const ASCEND_THRESHOLD = 1_000_000
export const PRESTIGE_KILLS_BASE = 1_000_000
export const PRESTIGE_RANK_EXPONENT = 0.5
export const PRESTIGE_BONUS_PER_RANK = 0.01

export function totalLifetimeKills(state: GameState): number {
  return (state.lifetimeKills ?? 0) + state.cookiesBakedAllTime
}

export function rankFromKills(kills: number): number {
  if (kills < ASCEND_THRESHOLD) {
    return 0
  }
  return Math.floor(Math.pow(kills / PRESTIGE_KILLS_BASE, PRESTIGE_RANK_EXPONENT))
}

export function prestigeMultiplier(state: GameState): number {
  return 1 + (state.prestigeLevel ?? 0) * PRESTIGE_BONUS_PER_RANK
}

export function projectAscendGain(state: GameState): number {
  const targetRank = rankFromKills(totalLifetimeKills(state))
  const currentRank = state.prestigeLevel ?? 0
  return Math.max(0, targetRank - currentRank)
}

export function canAscend(state: GameState): boolean {
  return projectAscendGain(state) > 0
}

export function ascend(state: GameState): GameState {
  if (!canAscend(state)) {
    return state
  }

  const lifetimeKills = totalLifetimeKills(state)
  const prestigeLevel = rankFromKills(lifetimeKills)
  const fresh = createInitialState()

  return {
    ...fresh,
    prestigeLevel,
    lifetimeKills,
    achievements: [...(state.achievements ?? [])],
    cookiesPerClick: prestigeMultiplier({ ...fresh, prestigeLevel, lifetimeKills }),
  }
}
