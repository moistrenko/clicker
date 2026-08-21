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

export const WORLD_EVENT_MIN_BAKED = 500
export const WORLD_EVENT_MEAN_SECONDS = 180
export const WORLD_EVENT_JITTER_MIN = 0.6
export const WORLD_EVENT_JITTER_MAX = 1.4

export const WORLD_EVENTS: readonly WorldEventDef[] = [
  {
    type: 'hordeNight',
    durationSeconds: 75,
    cpsMultiplier: 2,
    weight: 30,
  },
  {
    type: 'adrenalineRush',
    durationSeconds: 40,
    clickMultiplier: 3,
    weight: 25,
  },
  {
    type: 'supplyDrop',
    durationSeconds: 1,
    instantKillRatio: 0.2,
    weight: 25,
  },
  {
    type: 'eliteHunt',
    durationSeconds: 90,
    eliteSpawnBoost: 0.45,
    weight: 20,
  },
]

export const WORLD_EVENT_BY_TYPE: Readonly<Record<WorldEventType, WorldEventDef>> = Object.fromEntries(
  WORLD_EVENTS.map((event) => [event.type, event]),
) as Record<WorldEventType, WorldEventDef>
