export const SAVE_VERSION = 1

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

export interface GameState {
  version: number
  cookies: number
  cookiesBakedAllTime: number
  cookiesPerClick: number
  buildings: BuildingCounts
}

export interface StoreListing {
  building: BuildingDef
  owned: number
  price: number
  affordable: boolean
  locked: boolean
}
