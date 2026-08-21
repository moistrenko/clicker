import {
  WORLD_EVENT_BY_TYPE,
  WORLD_EVENT_JITTER_MAX,
  WORLD_EVENT_JITTER_MIN,
  WORLD_EVENT_MEAN_SECONDS,
  WORLD_EVENT_MIN_BAKED,
  WORLD_EVENTS,
} from '@/game/catalog/events'
import type { ActiveWorldEvent, GameState, WorldEventListing, WorldEventType } from '@/game/types'
import { randomGoldenPosition, type Rng } from '@/game/engine/goldenCookie'

let eventIdCounter = 0

export function resetWorldEventIdCounter(): void {
  eventIdCounter = 0
}

function nextEventId(): string {
  eventIdCounter += 1
  return `event-${eventIdCounter}`
}

export function nextWorldEventInterval(rng: Rng = Math.random): number {
  const jitter =
    WORLD_EVENT_JITTER_MIN + rng() * (WORLD_EVENT_JITTER_MAX - WORLD_EVENT_JITTER_MIN)
  return WORLD_EVENT_MEAN_SECONDS * jitter
}

export function getActiveWorldEvents(state: GameState, atTime = state.gameTime): ActiveWorldEvent[] {
  return (state.activeEvents ?? []).filter((event) => event.expiresAt > atTime)
}

export function expireWorldEvents(state: GameState): GameState {
  const activeEvents = getActiveWorldEvents(state)
  if (activeEvents.length === (state.activeEvents ?? []).length) {
    return state
  }
  return { ...state, activeEvents }
}

export function eventCpsMultiplier(state: GameState, atTime = state.gameTime): number {
  let mult = 1
  for (const event of getActiveWorldEvents(state, atTime)) {
    const def = WORLD_EVENT_BY_TYPE[event.type]
    if (def.cpsMultiplier) {
      mult *= def.cpsMultiplier
    }
  }
  return mult
}

export function eventClickMultiplier(state: GameState, atTime = state.gameTime): number {
  let mult = 1
  for (const event of getActiveWorldEvents(state, atTime)) {
    const def = WORLD_EVENT_BY_TYPE[event.type]
    if (def.clickMultiplier) {
      mult *= def.clickMultiplier
    }
  }
  return mult
}

export function eventEliteSpawnBoost(state: GameState, atTime = state.gameTime): number {
  let boost = 0
  for (const event of getActiveWorldEvents(state, atTime)) {
    const def = WORLD_EVENT_BY_TYPE[event.type]
    if (def.eliteSpawnBoost) {
      boost = Math.max(boost, def.eliteSpawnBoost)
    }
  }
  return boost
}

export function listActiveWorldEvents(state: GameState, atTime = state.gameTime): WorldEventListing[] {
  return getActiveWorldEvents(state, atTime)
    .map((event) => ({
      id: event.id,
      type: event.type,
      remainingSeconds: Math.max(0, event.expiresAt - atTime),
    }))
    .sort((a, b) => a.remainingSeconds - b.remainingSeconds)
}

function pickWorldEventType(rng: Rng): WorldEventType {
  const totalWeight = WORLD_EVENTS.reduce((sum, event) => sum + event.weight, 0)
  let roll = rng() * totalWeight
  for (const event of WORLD_EVENTS) {
    roll -= event.weight
    if (roll <= 0) {
      return event.type
    }
  }
  return WORLD_EVENTS[0]?.type ?? 'hordeNight'
}

export function ensureWorldEventScheduled(state: GameState, rng: Rng = Math.random): GameState {
  if (state.cookiesBakedAllTime < WORLD_EVENT_MIN_BAKED) {
    return state
  }
  if (state.nextWorldEventAt !== null && state.nextWorldEventAt !== undefined) {
    return state
  }
  return {
    ...state,
    nextWorldEventAt: state.gameTime + nextWorldEventInterval(rng),
  }
}

export function triggerWorldEvent(
  state: GameState,
  type: WorldEventType,
  rng: Rng = Math.random,
): GameState {
  const def = WORLD_EVENT_BY_TYPE[type]
  let next: GameState = expireWorldEvents(state)

  if (def.instantKillRatio) {
    const bonus = Math.max(50, Math.min(state.cookies * def.instantKillRatio + 100, 1_000_000_000))
    next = {
      ...next,
      cookies: next.cookies + bonus,
      cookiesBakedAllTime: next.cookiesBakedAllTime + bonus,
    }
  }

  const withoutSameType = getActiveWorldEvents(next).filter((event) => event.type !== type)
  const active: ActiveWorldEvent = {
    id: nextEventId(),
    type,
    expiresAt: next.gameTime + def.durationSeconds,
  }

  next = {
    ...next,
    activeEvents: [...withoutSameType, active],
    nextWorldEventAt: next.gameTime + nextWorldEventInterval(rng),
  }

  if (def.eliteSpawnBoost && !next.goldenCookie) {
    const pos = randomGoldenPosition(rng)
    next = {
      ...next,
      goldenCookie: pos,
      nextGoldenSpawnAt: next.gameTime + 20,
    }
  }

  return next
}

export function updateWorldEvents(state: GameState, rng: Rng = Math.random): GameState {
  let next = expireWorldEvents(state)
  next = ensureWorldEventScheduled(next, rng)

  if (next.cookiesBakedAllTime < WORLD_EVENT_MIN_BAKED) {
    return next
  }

  if (next.nextWorldEventAt !== null && next.gameTime >= next.nextWorldEventAt) {
    const type = pickWorldEventType(rng)
    next = triggerWorldEvent(next, type, rng)
  }

  return next
}
