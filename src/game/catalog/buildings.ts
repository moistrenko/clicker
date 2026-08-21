import type { BuildingDef, BuildingId } from '@/game/types'

export const BUILDINGS: readonly BuildingDef[] = [
  { id: 'cursor', name: 'Baseball Bat', baseCost: 15, baseCps: 0.1 },
  { id: 'grandma', name: 'Shotgun Granny', baseCost: 100, baseCps: 1 },
  { id: 'farm', name: 'Pit Trap', baseCost: 1100, baseCps: 8 },
  { id: 'mine', name: 'Landmine Field', baseCost: 12_000, baseCps: 47 },
  { id: 'factory', name: 'Ammo Factory', baseCost: 130_000, baseCps: 260 },
  { id: 'bank', name: 'Weapon Cache', baseCost: 1_400_000, baseCps: 1400 },
  { id: 'temple', name: 'Safe House', baseCost: 20_000_000, baseCps: 7800 },
  { id: 'wizardTower', name: 'Flamethrower Tower', baseCost: 330_000_000, baseCps: 44_000 },
  { id: 'shipment', name: 'Supply Airdrop', baseCost: 5_100_000_000, baseCps: 260_000 },
  { id: 'alchemyLab', name: 'Acid Lab', baseCost: 75_000_000_000, baseCps: 1_600_000 },
  { id: 'portal', name: 'Containment Zone', baseCost: 1_000_000_000_000, baseCps: 10_000_000 },
  { id: 'timeMachine', name: 'Time Rewind', baseCost: 14_000_000_000_000, baseCps: 65_000_000 },
  {
    id: 'antimatterCondenser',
    name: 'Railgun Array',
    baseCost: 170_000_000_000_000,
    baseCps: 430_000_000,
  },
  { id: 'prism', name: 'Sniper Nest', baseCost: 2_100_000_000_000_000, baseCps: 2_900_000_000 },
  {
    id: 'chancemaker',
    name: 'Critical Strike Unit',
    baseCost: 26_000_000_000_000_000,
    baseCps: 21_000_000_000,
  },
  {
    id: 'fractalEngine',
    name: 'Drone Swarm',
    baseCost: 310_000_000_000_000_000,
    baseCps: 150_000_000_000,
  },
  {
    id: 'javascriptConsole',
    name: 'Killbot AI',
    baseCost: 71_000_000_000_000_000_000,
    baseCps: 1_100_000_000_000,
  },
  { id: 'idleverse', name: 'Parallel Outbreak', baseCost: 1.2e22, baseCps: 8.3e12 },
  { id: 'cortexBaker', name: 'Psionic Jammer', baseCost: 1.9e24, baseCps: 6.4e13 },
  { id: 'you', name: 'Clone Legion', baseCost: 4.7e26, baseCps: 5.1e14 },
  { id: 'warRig', name: 'War Rig', baseCost: 1.1e29, baseCps: 3.8e15 },
  { id: 'orbitalLaser', name: 'Orbital Laser', baseCost: 2.6e31, baseCps: 2.9e16 },
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
