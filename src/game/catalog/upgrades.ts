import type { BuildingId, UpgradeDef } from '@/game/types'
import { BUILDINGS, getBuilding } from './buildings'

const TIERS = [
  { unlockOwned: 1, costMultiplier: 10 },
  { unlockOwned: 5, costMultiplier: 50 },
  { unlockOwned: 25, costMultiplier: 500 },
] as const

const CURSOR_UPGRADES: readonly UpgradeDef[] = [
  {
    id: 'cursor-1',
    name: 'Reinforced grip',
    description: 'Manual strikes and baseball bats score twice as many kills.',
    buildingId: 'cursor',
    cost: 100,
    unlockOwned: 1,
    type: 'double',
    alsoBoostClick: true,
  },
  {
    id: 'cursor-2',
    name: 'Adrenaline shots',
    description: 'Manual strikes and baseball bats score twice as many kills.',
    buildingId: 'cursor',
    cost: 500,
    unlockOwned: 1,
    type: 'double',
    alsoBoostClick: true,
  },
  {
    id: 'cursor-3',
    name: 'Dual wield bats',
    description: 'Manual strikes and baseball bats score twice as many kills.',
    buildingId: 'cursor',
    cost: 10_000,
    unlockOwned: 10,
    type: 'double',
    alsoBoostClick: true,
  },
]

const BUILDING_UPGRADE_NAMES: Record<
  Exclude<BuildingId, 'cursor'>,
  readonly [string, string, string]
> = {
  grandma: ['Buckshot spread', 'Sawed-off barrels', 'Dragon breath rounds'],
  farm: ['Sharper spikes', 'Hidden pits', 'Bait piles'],
  mine: ['Proximity sensors', 'Tripwire mesh', 'Remote detonators'],
  factory: ['Hollow-point line', 'Armor-piercing rounds', 'Incendiary loads'],
  bank: ['Locked racks', 'Quick-draw holsters', 'Explosive reserves'],
  temple: ['Reinforced doors', 'Barricaded windows', 'Roof snipers'],
  wizardTower: ['Longer hoses', 'Napalm mix', 'Fuel air bursts'],
  shipment: ['Night drops', 'GPS pallets', 'Emergency resupply'],
  alchemyLab: ['Corrosive blend', 'Flesh-eater acid', 'Meltdown formula'],
  portal: ['Quarantine seals', 'Containment foam', 'Kill-on-sight protocol'],
  timeMachine: ['Rewind ammo', 'Paradox shells', 'Temporal shrapnel'],
  antimatterCondenser: ['Overcharged rails', 'Magnetic accelerators', 'Orbital strikes'],
  prism: ['Thermal scopes', 'Match-grade rounds', 'One-shot doctrine'],
  chancemaker: ['Lucky headshots', 'Critical targeting', 'Jackpot kill chain'],
  fractalEngine: ['Swarm tactics', 'Hive coordination', 'Saturation bombing'],
  javascriptConsole: ['Auto-targeting patch', 'Threat prioritization', 'Kill quota overflow'],
  idleverse: ['Outbreak mapping', 'Cross-dimensional hunt', 'Infinite horde exploit'],
  cortexBaker: ['Mind scramble', 'Neural overload', 'Brain fry cascade'],
  you: ['Combat clones', 'Elite duplicates', 'Apocalypse you'],
  warRig: ['Spiked bumpers', 'Ram plating', 'Highway purge'],
  orbitalLaser: ['Target uplink', 'Sustained beam', 'City eraser protocol'],
}

function upgradesForBuilding(id: Exclude<BuildingId, 'cursor'>): UpgradeDef[] {
  const building = getBuilding(id)
  const names = BUILDING_UPGRADE_NAMES[id]
  return TIERS.map((tier, index) => {
    const name = names[index]
    if (!name) {
      throw new Error(`Missing upgrade name for ${id} tier ${index + 1}`)
    }
    return {
      id: `${id}-${index + 1}`,
      name,
      description: `Doubles ${building.name} kill rate.`,
      buildingId: id,
      cost: building.baseCost * tier.costMultiplier,
      unlockOwned: tier.unlockOwned,
      type: 'double' as const,
    }
  })
}

export const UPGRADES: readonly UpgradeDef[] = [
  ...CURSOR_UPGRADES,
  ...BUILDINGS.filter((building) => building.id !== 'cursor').flatMap((building) =>
    upgradesForBuilding(building.id as Exclude<BuildingId, 'cursor'>),
  ),
]

export const UPGRADE_BY_ID: Readonly<Record<string, UpgradeDef>> = Object.fromEntries(
  UPGRADES.map((upgrade) => [upgrade.id, upgrade]),
)

export function getUpgrade(id: string): UpgradeDef | undefined {
  return UPGRADE_BY_ID[id]
}
