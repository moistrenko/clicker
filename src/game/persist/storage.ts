import { createInitialState, getCookiesPerClick } from '@/game/engine'
import { BUILDINGS } from '@/game/catalog/buildings'
import { getUpgrade } from '@/game/catalog/upgrades'
import { SAVE_VERSION, type BuildingCounts, type GameState } from '@/game/types'

export const STORAGE_KEY = 'clicker.save'
export const SAVE_DEBOUNCE_MS = 400

const SUPPORTED_SAVE_VERSIONS = new Set([1, 2])

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
      buildings: parseBuildings(data.buildings),
      upgrades: parseUpgrades(data.upgrades),
    }
    state.cookiesPerClick = getCookiesPerClick(state)
    return state
  } catch {
    return null
  }
}

export function loadGame(storage: Pick<Storage, 'getItem'> = localStorage): GameState {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return createInitialState()
  }
  return parseSave(raw) ?? createInitialState()
}

export function saveGame(state: GameState, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
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
