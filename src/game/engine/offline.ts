import { BUILDINGS } from '@/game/catalog/buildings'
import { OFFLINE_MAX_SECONDS } from '@/game/catalog/offline'
import { getUpgrade } from '@/game/catalog/upgrades'
import { cpsBuffMultipliers, expireBuffs } from '@/game/engine/goldenCookie'
import { prestigeMultiplier } from '@/game/engine/prestige'
import type { BuildingId, GameState } from '@/game/types'

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

function offlineTotalCps(state: GameState, atTime = state.gameTime): number {
  const { frenzy, building: buildingBuffs } = cpsBuffMultipliers(state, atTime)
  let cps = 0
  for (const building of BUILDINGS) {
    const owned = state.buildings[building.id] ?? 0
    const specialMult = buildingBuffs.get(building.id) ?? 1
    cps += owned * building.baseCps * buildingMultiplier(state, building.id) * specialMult
  }
  return cps * frenzy * prestigeMultiplier(state)
}

export function computeOfflineSeconds(lastSavedAt: number, nowMs: number): number {
  if (!(lastSavedAt > 0) || !(nowMs > lastSavedAt)) {
    return 0
  }

  const elapsedSeconds = (nowMs - lastSavedAt) / 1000
  return Math.min(elapsedSeconds, OFFLINE_MAX_SECONDS)
}

export function tickOffline(state: GameState, dtSeconds: number): GameState {
  if (!(dtSeconds > 0)) {
    return state
  }

  let next: GameState = {
    ...state,
    gameTime: state.gameTime + dtSeconds,
  }
  next = expireBuffs(next)

  const gained = offlineTotalCps(next) * dtSeconds
  if (gained > 0) {
    next = {
      ...next,
      cookies: next.cookies + gained,
      cookiesBakedAllTime: next.cookiesBakedAllTime + gained,
    }
  }

  return next
}

export function applyOfflineProgress(
  state: GameState,
  nowMs: number,
): { state: GameState; offlineKills: number } {
  const offlineSeconds = computeOfflineSeconds(state.lastSavedAt, nowMs)
  if (offlineSeconds <= 0) {
    return { state, offlineKills: 0 }
  }

  const cookiesBefore = state.cookies
  const next = tickOffline(state, offlineSeconds)
  return {
    state: next,
    offlineKills: next.cookies - cookiesBefore,
  }
}
