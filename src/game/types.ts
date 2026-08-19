export const SAVE_VERSION = 3

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

export interface GameState {
  version: number
  cookies: number
  cookiesBakedAllTime: number
  cookiesPerClick: number
  buildings: BuildingCounts
  upgrades: string[]
  gameTime: number
  activeBuffs: ActiveBuff[]
  goldenCookie: GoldenCookieSpawn | null
  nextGoldenSpawnAt: number | null
}

export interface BuffListing {
  id: string
  name: string
  description: string
  remainingSeconds: number
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
