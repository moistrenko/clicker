export const SAVE_VERSION = 6

export type BuildingId =
  | 'cursor'
  | 'grandma'
  | 'farm'
  | 'mine'
  | 'factory'
  | 'bank'
  | 'temple'
  | 'wizardTower'
  | 'shipment'
  | 'alchemyLab'
  | 'portal'
  | 'timeMachine'
  | 'antimatterCondenser'
  | 'prism'
  | 'chancemaker'
  | 'fractalEngine'
  | 'javascriptConsole'
  | 'idleverse'
  | 'cortexBaker'
  | 'you'

export interface BuildingDef {
  id: BuildingId
  name: string
  baseCost: number
  baseCps: number
}

export type BuildingCounts = Record<BuildingId, number>

export type UpgradeType = 'double'

export interface UpgradeDef {
  id: string
  name: string
  description: string
  buildingId: BuildingId
  cost: number
  unlockOwned: number
  type: UpgradeType
  alsoBoostClick?: boolean
}

export type BuffType = 'frenzy' | 'lucky' | 'clickFrenzy' | 'buildingSpecial'

export interface ActiveBuff {
  id: string
  type: BuffType
  multiplier?: number
  buildingId?: BuildingId
  expiresAt: number
}

export interface GoldenCookieSpawn {
  x: number
  y: number
}

export type AchievementCondition =
  | { type: 'totalKills'; threshold: number }
  | { type: 'clicks'; threshold: number }
  | { type: 'buildingOwned'; buildingId: BuildingId; count: number }
  | { type: 'totalBuildings'; threshold: number }
  | { type: 'cps'; threshold: number }
  | { type: 'upgradesOwned'; threshold: number }

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  condition: AchievementCondition
}

export interface AchievementListing {
  achievement: AchievementDef
  unlocked: boolean
}

export interface GameState {
  version: number
  cookies: number
  cookiesBakedAllTime: number
  cookiesPerClick: number
  totalClicks: number
  buildings: BuildingCounts
  upgrades: string[]
  achievements: string[]
  gameTime: number
  activeBuffs: ActiveBuff[]
  goldenCookie: GoldenCookieSpawn | null
  nextGoldenSpawnAt: number | null
  prestigeLevel: number
  lifetimeKills: number
  lastSavedAt: number
}

export interface BuffListing {
  id: string
  type: BuffType
  name: string
  description: string
  remainingSeconds: number
  buildingId?: BuildingId
  multiplier?: number
}

export interface StoreListing {
  building: BuildingDef
  owned: number
  price: number
  affordable: boolean
  locked: boolean
}

export interface UpgradeListing {
  upgrade: UpgradeDef
  affordable: boolean
}
