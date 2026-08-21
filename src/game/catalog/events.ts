import type { WorldEventType } from '@/game/types'

export interface WorldEventDef {
  type: WorldEventType
  durationSeconds: number
  cpsMultiplier?: number
  clickMultiplier?: number
  eliteSpawnBoost?: number
  instantKillRatio?: number
  weight: number
}

export const WORLD_EVENT_MIN_BAKED = 250
export const WORLD_EVENT_MEAN_SECONDS = 140
export const WORLD_EVENT_JITTER_MIN = 0.55
export const WORLD_EVENT_JITTER_MAX = 1.35

export const WORLD_EVENTS: readonly WorldEventDef[] = [
  {
    type: 'hordeNight',
    durationSeconds: 90,
    cpsMultiplier: 2,
    weight: 30,
  },
  {
    type: 'adrenalineRush',
    durationSeconds: 45,
    clickMultiplier: 3.5,
    weight: 26,
  },
  {
    type: 'supplyDrop',
    durationSeconds: 8,
    instantKillRatio: 0.22,
    weight: 24,
  },
  {
    type: 'eliteHunt',
    durationSeconds: 100,
    eliteSpawnBoost: 0.5,
    weight: 20,
  },
]

export const WORLD_EVENT_BY_TYPE: Readonly<Record<WorldEventType, WorldEventDef>> = Object.fromEntries(
  WORLD_EVENTS.map((event) => [event.type, event]),
) as Record<WorldEventType, WorldEventDef>
