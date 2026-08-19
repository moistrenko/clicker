import { clickTarget } from '@/theme/clickTarget'
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
    name: 'Reinforced index finger',
    description: `Clicks and cursors bake twice as many ${clickTarget.pluralName}.`,
    buildingId: 'cursor',
    cost: 100,
    unlockOwned: 1,
    type: 'double',
    alsoBoostClick: true,
  },
  {
    id: 'cursor-2',
    name: 'Carpal tunnel prevention cream',
    description: `Clicks and cursors bake twice as many ${clickTarget.pluralName}.`,
    buildingId: 'cursor',
    cost: 500,
    unlockOwned: 1,
    type: 'double',
    alsoBoostClick: true,
  },
  {
    id: 'cursor-3',
    name: 'Ambidextrous',
    description: `Clicks and cursors bake twice as many ${clickTarget.pluralName}.`,
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
  grandma: ['Forwards from Grandma', 'Steel-plated rolling pins', 'Lubricated dentures'],
  farm: ['Cheap hoes', 'Fertilizer', 'Cookie trees'],
  mine: ['Sugar gas', 'Megadrill', 'Ultradrill'],
  factory: ['Sturdier conveyor belts', 'Child labor', 'Sweatshop'],
  bank: ['Taller tellers', 'Scissor-resistant credit cards', 'Acid-proof vaults'],
  temple: ['Golden idols', 'Sacrifices', 'Delicious blessing'],
  wizardTower: ['Pointier hats', 'Beardlier beards', 'Ancient grimoires'],
  shipment: ['Vanilla nebulae', 'Wormholes', 'Frequent flyer'],
  alchemyLab: ['Antimony', 'Essence of dough', 'True chocolate'],
  portal: ['Ancient tablet', 'Insane oatling workers', 'Soul bond'],
  timeMachine: ['Flux capacitors', 'Time paradox resolver', 'Quantum conundrum'],
  antimatterCondenser: ['Sugar bosons', 'String theory', 'Large macaron collider'],
  prism: ['Gem polish', '9th color', 'Chocolate light'],
  chancemaker: ['Your lucky cookie', 'All bets are off', 'Winning lottery ticket'],
  fractalEngine: ['Iterative processing', 'Recursive miracles', 'P1 layer'],
  javascriptConsole: ['JS for dummies', '64bit arrays', 'Stack overflow'],
  idleverse: ['Manifest destiny', 'Multiverse in a nutshell', 'All-you-can-click'],
  cortexBaker: ['Neural shackles', 'Generating aliases', 'Synaptic sugar'],
  you: ['Genetically-modified', 'Crossbreeding', 'Cookie-injected'],
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
      description: `Doubles ${building.name} production of ${clickTarget.pluralName}.`,
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
