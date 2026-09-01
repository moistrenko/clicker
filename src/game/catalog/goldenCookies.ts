import type { BuffType } from '@/game/types'

export const GOLDEN_COOKIE_MIN_BAKED = 100
export const GOLDEN_SPAWN_MEAN_SECONDS = 90
export const GOLDEN_SPAWN_JITTER_MIN = 0.5
export const GOLDEN_SPAWN_JITTER_MAX = 1.5

export const FRENZY_MULTIPLIER = 7
export const FRENZY_DURATION_SECONDS = 77
export const CLICK_FRENZY_MULTIPLIER = 777
export const CLICK_FRENZY_DURATION_SECONDS = 13
export const BUILDING_SPECIAL_MULTIPLIER = 7
export const BUILDING_SPECIAL_DURATION_SECONDS = 77
export const LUCKY_MIN_BONUS = 13
export const LUCKY_BANK_RATIO = 0.15
export const LUCKY_MAX_BONUS = 1_000_000_000

export interface BuffMeta {
  type: BuffType
  name: string
  description: string
}

export const BUFF_META: Record<BuffType, BuffMeta> = {
  frenzy: {
    type: 'frenzy',
    name: 'Slaughter mode',
    description: 'Kill rate ×7',
  },
  lucky: {
    type: 'lucky',
    name: 'Headshot bonus',
    description: 'A sudden burst of kills',
  },
  clickFrenzy: {
    type: 'clickFrenzy',
    name: 'Rage mode',
    description: 'Manual strikes ×777',
  },
  buildingSpecial: {
    type: 'buildingSpecial',
    name: 'Weapon overdrive',
    description: 'One weapon type ×7 kill rate',
  },
  duelSpoils: {
    type: 'duelSpoils',
    name: 'Duel spoils',
    description: 'Weapon kill rate ×3',
  },
}

export interface EffectWeight {
  type: BuffType
  weight: number
}

export const GOLDEN_COOKIE_EFFECTS: EffectWeight[] = [
  { type: 'frenzy', weight: 30 },
  { type: 'lucky', weight: 25 },
  { type: 'clickFrenzy', weight: 25 },
  { type: 'buildingSpecial', weight: 20 },
]
