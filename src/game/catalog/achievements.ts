import type { AchievementDef } from '@/game/types'

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Score your first kill.',
    icon: '🩸',
    condition: { type: 'totalKills', threshold: 1 },
  },
  {
    id: 'finger-workout',
    name: 'Finger Workout',
    description: 'Smash the zombie 100 times.',
    icon: '👆',
    condition: { type: 'clicks', threshold: 100 },
  },
  {
    id: 'fresh-meat',
    name: 'Fresh Meat',
    description: 'Rack up 100 total kills.',
    icon: '🧟',
    condition: { type: 'totalKills', threshold: 100 },
  },
  {
    id: 'bat-basics',
    name: 'Bat Basics',
    description: 'Own your first Baseball Bat.',
    icon: '🏏',
    condition: { type: 'buildingOwned', buildingId: 'cursor', count: 1 },
  },
  {
    id: 'granny-guard',
    name: 'Granny Guard',
    description: 'Recruit a Shotgun Granny.',
    icon: '👵',
    condition: { type: 'buildingOwned', buildingId: 'grandma', count: 1 },
  },
  {
    id: 'click-crazy',
    name: 'Click Crazy',
    description: 'Smash the zombie 1,000 times.',
    icon: '💀',
    condition: { type: 'clicks', threshold: 1000 },
  },
  {
    id: 'still-breathing',
    name: 'Still Breathing',
    description: 'Survive to 1,000 total kills.',
    icon: '🛡️',
    condition: { type: 'totalKills', threshold: 1000 },
  },
  {
    id: 'armory-starter',
    name: 'Armory Starter',
    description: 'Own 10 weapons total.',
    icon: '🔫',
    condition: { type: 'totalBuildings', threshold: 10 },
  },
  {
    id: 'bat-hoarder',
    name: 'Bat Hoarder',
    description: 'Stockpile 5 Baseball Bats.',
    icon: '⚾',
    condition: { type: 'buildingOwned', buildingId: 'cursor', count: 5 },
  },
  {
    id: 'granny-squad',
    name: 'Granny Squad',
    description: 'Deploy 5 Shotgun Grannies.',
    icon: '👵',
    condition: { type: 'buildingOwned', buildingId: 'grandma', count: 5 },
  },
  {
    id: 'pit-digger',
    name: 'Pit Digger',
    description: 'Build your first Pit Trap.',
    icon: '🕳️',
    condition: { type: 'buildingOwned', buildingId: 'farm', count: 1 },
  },
  {
    id: 'upgrade-initiate',
    name: 'Upgrade Initiate',
    description: 'Purchase your first upgrade.',
    icon: '⬆️',
    condition: { type: 'upgradesOwned', threshold: 1 },
  },
  {
    id: 'fully-loaded',
    name: 'Fully Loaded',
    description: 'Own 5 upgrades.',
    icon: '📦',
    condition: { type: 'upgradesOwned', threshold: 5 },
  },
  {
    id: 'killing-machine',
    name: 'Killing Machine',
    description: 'Reach 100 kills per second.',
    icon: '⚡',
    condition: { type: 'cps', threshold: 100 },
  },
  {
    id: 'weapon-collector',
    name: 'Weapon Collector',
    description: 'Own 25 weapons total.',
    icon: '🗡️',
    condition: { type: 'totalBuildings', threshold: 25 },
  },
  {
    id: 'mass-extermination',
    name: 'Mass Extermination',
    description: 'Amass 10,000 total kills.',
    icon: '☠️',
    condition: { type: 'totalKills', threshold: 10_000 },
  },
  {
    id: 'click-fury',
    name: 'Click Fury',
    description: 'Smash the zombie 10,000 times.',
    icon: '👊',
    condition: { type: 'clicks', threshold: 10_000 },
  },
  {
    id: 'factory-online',
    name: 'Factory Online',
    description: 'Open an Ammo Factory.',
    icon: '🏭',
    condition: { type: 'buildingOwned', buildingId: 'factory', count: 1 },
  },
  {
    id: 'safe-house',
    name: 'Safe House',
    description: 'Establish a Safe House.',
    icon: '🏠',
    condition: { type: 'buildingOwned', buildingId: 'temple', count: 1 },
  },
  {
    id: 'apocalypse-now',
    name: 'Apocalypse Now',
    description: 'Reach 100,000 total kills.',
    icon: '🌋',
    condition: { type: 'totalKills', threshold: 100_000 },
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Reach 1,000 kills per second.',
    icon: '🔥',
    condition: { type: 'cps', threshold: 1000 },
  },
  {
    id: 'veteran-clicker',
    name: 'Veteran Clicker',
    description: 'Smash the zombie 50,000 times.',
    icon: '🎖️',
    condition: { type: 'clicks', threshold: 50_000 },
  },
] as const

export const ACHIEVEMENT_BY_ID: Readonly<Record<string, AchievementDef>> = Object.fromEntries(
  ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]),
)

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_BY_ID[id]
}
