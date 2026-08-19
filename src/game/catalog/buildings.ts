import type { BuildingDef, BuildingId } from '@/game/types'

export const BUILDINGS: readonly BuildingDef[] = [
  { id: 'cursor', name: 'Cursor', baseCost: 15, baseCps: 0.1 },
  { id: 'grandma', name: 'Grandma', baseCost: 100, baseCps: 1 },
  { id: 'farm', name: 'Farm', baseCost: 1100, baseCps: 8 },
  { id: 'mine', name: 'Mine', baseCost: 12_000, baseCps: 47 },
  { id: 'factory', name: 'Factory', baseCost: 130_000, baseCps: 260 },
  { id: 'bank', name: 'Bank', baseCost: 1_400_000, baseCps: 1400 },
  { id: 'temple', name: 'Temple', baseCost: 20_000_000, baseCps: 7800 },
  { id: 'wizardTower', name: 'Wizard Tower', baseCost: 330_000_000, baseCps: 44_000 },
  { id: 'shipment', name: 'Shipment', baseCost: 5_100_000_000, baseCps: 260_000 },
  { id: 'alchemyLab', name: 'Alchemy Lab', baseCost: 75_000_000_000, baseCps: 1_600_000 },
  { id: 'portal', name: 'Portal', baseCost: 1_000_000_000_000, baseCps: 10_000_000 },
  { id: 'timeMachine', name: 'Time Machine', baseCost: 14_000_000_000_000, baseCps: 65_000_000 },
  {
    id: 'antimatterCondenser',
    name: 'Antimatter Condenser',
    baseCost: 170_000_000_000_000,
    baseCps: 430_000_000,
  },
  { id: 'prism', name: 'Prism', baseCost: 2_100_000_000_000_000, baseCps: 2_900_000_000 },
  {
    id: 'chancemaker',
    name: 'Chancemaker',
    baseCost: 26_000_000_000_000_000,
    baseCps: 21_000_000_000,
  },
  {
    id: 'fractalEngine',
    name: 'Fractal Engine',
    baseCost: 310_000_000_000_000_000,
    baseCps: 150_000_000_000,
  },
  {
    id: 'javascriptConsole',
    name: 'Javascript Console',
    baseCost: 71_000_000_000_000_000_000,
    baseCps: 1_100_000_000_000,
  },
  { id: 'idleverse', name: 'Idleverse', baseCost: 1.2e22, baseCps: 8.3e12 },
  { id: 'cortexBaker', name: 'Cortex Baker', baseCost: 1.9e24, baseCps: 6.4e13 },
  { id: 'you', name: 'You', baseCost: 4.7e26, baseCps: 5.1e14 },
]

export const BUILDING_BY_ID: Readonly<Record<BuildingId, BuildingDef>> = Object.fromEntries(
  BUILDINGS.map((building) => [building.id, building]),
) as Record<BuildingId, BuildingDef>

export function getBuilding(id: BuildingId): BuildingDef {
  const building = BUILDING_BY_ID[id]
  if (!building) {
    throw new Error(`Unknown building: ${id}`)
  }
  return building
}
