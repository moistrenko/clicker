import { createInitialState } from '@/game/engine'
import { BUILDINGS } from '@/game/catalog/buildings'
import { SAVE_VERSION, type BuildingCounts, type GameState } from '@/game/types'

export const STORAGE_KEY = 'clicker.save'
export const SAVE_DEBOUNCE_MS = 400

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

export function parseSave(raw: string): GameState | null {
  try {
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data)) {
      return null
    }

    const version = readNumber(data.version, 0)
    if (version !== SAVE_VERSION) {
      return null
    }

    return {
      version: SAVE_VERSION,
      cookies: Math.max(0, readNumber(data.cookies, 0)),
      cookiesBakedAllTime: Math.max(0, readNumber(data.cookiesBakedAllTime, 0)),
      cookiesPerClick: Math.max(0, readNumber(data.cookiesPerClick, 1)),
      buildings: parseBuildings(data.buildings),
    }
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
