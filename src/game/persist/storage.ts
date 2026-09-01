import {
  createInitialState,
  ensureGoldenSpawnScheduled,
  expireBuffs,
  getCookiesPerClick,
  migratePrestigeLevel,
  normalizePrestigeLevel,
  parseAchievements,
} from '@/game/engine'
import { applyOfflineProgress } from '@/game/engine/offline'
import { BUILDINGS } from '@/game/catalog/buildings'
import { getUpgrade } from '@/game/catalog/upgrades'
import {
  SAVE_VERSION,
  type ActiveBuff,
  type ActiveWorldEvent,
  type BuildingCounts,
  type GameState,
  type GoldenCookieSpawn,
} from '@/game/types'

export const STORAGE_KEY = 'clicker.save'
export const SAVE_DEBOUNCE_MS = 400

const SUPPORTED_SAVE_VERSIONS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function parseBuildings(value: unknown): BuildingCounts {
  const buildings = createInitialState().buildings
  if (!isRecord(value)) {
    return buildings
  }

  for (const building of BUILDINGS) {
    const owned = value[building.id]
    if (typeof owned === 'number' && Number.isFinite(owned) && owned >= 0) {
      buildings[building.id] = Math.floor(owned)
    }
  }

  return buildings
}

function parseUpgrades(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const owned: string[] = []
  const seen = new Set<string>()
  for (const id of value) {
    if (typeof id !== 'string' || seen.has(id) || !getUpgrade(id)) {
      continue
    }
    seen.add(id)
    owned.push(id)
  }
  return owned
}

function parseActiveBuffs(value: unknown): ActiveBuff[] {
  if (!Array.isArray(value)) {
    return []
  }

  const buffs: ActiveBuff[] = []
  for (const item of value) {
    if (!isRecord(item)) {
      continue
    }
    const type = item.type
    if (
      type !== 'frenzy' &&
      type !== 'lucky' &&
      type !== 'clickFrenzy' &&
      type !== 'buildingSpecial' &&
      type !== 'duelSpoils'
    ) {
      continue
    }
    const id = typeof item.id === 'string' ? item.id : `buff-${buffs.length + 1}`
    const expiresAt = readNumber(item.expiresAt, 0)
    const buff: ActiveBuff = { id, type, expiresAt }
    if (typeof item.multiplier === 'number' && Number.isFinite(item.multiplier)) {
      buff.multiplier = item.multiplier
    }
    if (typeof item.buildingId === 'string') {
      const known = BUILDINGS.some((building) => building.id === item.buildingId)
      if (known) {
        buff.buildingId = item.buildingId as ActiveBuff['buildingId']
      }
    }
    buffs.push(buff)
  }
  return buffs
}

function parseActiveEvents(value: unknown): ActiveWorldEvent[] {
  if (!Array.isArray(value)) {
    return []
  }
  const events: ActiveWorldEvent[] = []
  for (const item of value) {
    if (!isRecord(item)) {
      continue
    }
    const type = item.type
    if (
      type !== 'hordeNight' &&
      type !== 'adrenalineRush' &&
      type !== 'supplyDrop' &&
      type !== 'eliteHunt'
    ) {
      continue
    }
    const id = typeof item.id === 'string' ? item.id : `event-${events.length + 1}`
    const expiresAt = readNumber(item.expiresAt, 0)
    events.push({ id, type, expiresAt })
  }
  return events
}

function parseGoldenCookie(value: unknown): GoldenCookieSpawn | null {
  if (!isRecord(value)) {
    return null
  }
  const x = readNumber(value.x, -1)
  const y = readNumber(value.y, -1)
  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return null
  }
  return { x, y }
}

function finalizeLoadedState(state: GameState): GameState {
  const lifetimeKills = (state.lifetimeKills ?? 0) + state.cookiesBakedAllTime
  let next: GameState = {
    ...state,
    version: SAVE_VERSION,
    totalClicks: state.totalClicks ?? 0,
    achievements: state.achievements ?? [],
    gameTime: state.gameTime ?? 0,
    activeBuffs: state.activeBuffs ?? [],
    goldenCookie: null,
    nextGoldenSpawnAt: state.nextGoldenSpawnAt ?? null,
    prestigeLevel: normalizePrestigeLevel(state.prestigeLevel ?? 0, lifetimeKills),
    lifetimeKills: state.lifetimeKills ?? 0,
    duelWins: state.duelWins ?? 0,
    duelLosses: state.duelLosses ?? 0,
    duelDraws: state.duelDraws ?? 0,
    lastSavedAt: state.lastSavedAt ?? 0,
    activeEvents: state.activeEvents ?? [],
    nextWorldEventAt: state.nextWorldEventAt ?? null,
  }
  next = expireBuffs(next)
  next = ensureGoldenSpawnScheduled(next)
  next.cookiesPerClick = getCookiesPerClick(next)
  return next
}

export function parseSave(raw: string): GameState | null {
  try {
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data)) {
      return null
    }

    const version = readNumber(data.version, 0)
    if (!SUPPORTED_SAVE_VERSIONS.has(version)) {
      return null
    }

    const state: GameState = {
      version: SAVE_VERSION,
      cookies: Math.max(0, readNumber(data.cookies, 0)),
      cookiesBakedAllTime: Math.max(0, readNumber(data.cookiesBakedAllTime, 0)),
      cookiesPerClick: 1,
      totalClicks: Math.max(0, readNumber(data.totalClicks, 0)),
      buildings: parseBuildings(data.buildings),
      upgrades: parseUpgrades(data.upgrades),
      achievements: parseAchievements(data.achievements),
      gameTime: Math.max(0, readNumber(data.gameTime, 0)),
      activeBuffs: parseActiveBuffs(data.activeBuffs),
      goldenCookie: parseGoldenCookie(data.goldenCookie),
      nextGoldenSpawnAt:
        data.nextGoldenSpawnAt === null || data.nextGoldenSpawnAt === undefined
          ? null
          : Math.max(0, readNumber(data.nextGoldenSpawnAt, 0)),
      prestigeLevel: normalizePrestigeLevel(
        Math.max(0, readNumber(data.prestigeLevel, 0)),
        Math.max(0, readNumber(data.lifetimeKills, 0)) + Math.max(0, readNumber(data.cookiesBakedAllTime, 0)),
      ),
      lifetimeKills: Math.max(0, readNumber(data.lifetimeKills, 0)),
      duelWins: Math.max(0, readNumber(data.duelWins, 0)),
      duelLosses: Math.max(0, readNumber(data.duelLosses, 0)),
      duelDraws: Math.max(0, readNumber(data.duelDraws, 0)),
      lastSavedAt: Math.max(0, readNumber(data.lastSavedAt, 0)),
      activeEvents: parseActiveEvents(data.activeEvents),
      nextWorldEventAt:
        data.nextWorldEventAt === null || data.nextWorldEventAt === undefined
          ? null
          : Math.max(0, readNumber(data.nextWorldEventAt, 0)),
    }
    return finalizeLoadedState(state)
  } catch {
    return null
  }
}

export interface LoadGameResult {
  state: GameState
  offlineKills: number
}

export function loadGame(
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  nowMs = Date.now(),
): LoadGameResult {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return { state: createInitialState(), offlineKills: 0 }
  }

  const parsed = parseSave(raw)
  if (!parsed) {
    return { state: createInitialState(), offlineKills: 0 }
  }

  const { state, offlineKills } = applyOfflineProgress(parsed, nowMs)
  const withTimestamp = { ...state, lastSavedAt: nowMs }
  saveGame(withTimestamp, storage)
  return { state: withTimestamp, offlineKills }
}

export function saveGame(state: GameState, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSavedAt: Date.now() }))
}

export function createDebouncedSave(
  write: (state: GameState) => void,
  delayMs = SAVE_DEBOUNCE_MS,
): { schedule: (state: GameState) => void; flush: (state: GameState) => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined

  const cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  const flush = (state: GameState) => {
    cancel()
    write(state)
  }

  const schedule = (state: GameState) => {
    cancel()
    timer = setTimeout(() => {
      write(state)
      timer = undefined
    }, delayMs)
  }

  return { schedule, flush, cancel }
}
