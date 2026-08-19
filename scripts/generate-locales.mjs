import { BUILDINGS } from '../src/game/catalog/buildings.ts'
import { UPGRADES } from '../src/game/catalog/upgrades.ts'
import { ACHIEVEMENTS } from '../src/game/catalog/achievements.ts'
import { NEWS_TICKER } from '../src/game/catalog/news.ts'
import { BUFF_META } from '../src/game/catalog/goldenCookies.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../src/i18n/messages')
mkdirSync(outDir, { recursive: true })

const buildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, b.name]))
const upgrades = Object.fromEntries(UPGRADES.map((u) => [u.id, { name: u.name }]))
const achievements = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, { name: a.name, description: a.description }]),
)
const buffs = Object.fromEntries(
  Object.entries(BUFF_META).map(([k, v]) => [k, { name: v.name, description: v.description }]),
)

const en = {
  game: {
    title: 'Zombie Clicker',
    zoneLabel: 'Horde Zone',
    storeLabel: 'Armory',
    displayName: 'Zombie',
    pluralName: 'kills',
    alt: 'Zombie',
    totalStatLabel: 'Total kills',
    weaponsStatLabel: 'Weapons owned',
    perSecondSuffix: 'kills/sec',
    clickActionLabel: 'Smash zombie',
    collectBonusLabel: 'Collect elite zombie',
    newsKicker: 'News',
    newsAria: '{name} news',
  },
  ui: {
    stats: 'Stats',
    statsAria: 'Survival stats',
    achievements: 'Achievements',
    locked: '???',
    keepSmashing: 'Keep smashing to unlock.',
    achievementUnlocked: 'Achievement unlocked',
    dismiss: 'Dismiss',
    offlineLabel: 'While you were away',
    offlineMessage: 'you scored {kills} kills',
    activeBuffs: 'Active buffs',
    upgrades: 'Upgrades',
    ascend: 'Ascend',
    ascendTagline: 'Leave the horde behind and start stronger.',
    survivorRank: 'Survivor Rank',
    permanentBonus: 'Permanent bonus',
    permanentBonusValue: '+{percent}% kills/sec & click power',
    nextAscend: 'Next ascend',
    rank: 'rank',
    ranks: 'ranks',
    ascendButton: 'Ascend',
    ascendHint: 'Earn enough lifetime kills to gain your next Survivor Rank.',
    ascendConfirm:
      'Leave the horde behind and start stronger? This resets your run but keeps achievements and Survivor Rank.',
    owned: '{count} owned',
    unknown: 'Unknown',
    cost: 'Cost {price}',
    settingsTitle: 'Survivor log',
    settingsHint: 'Back up, restore, or purge your horde progress.',
    exportLog: 'Export log',
    importLog: 'Import log',
    applyImport: 'Apply imported log',
    wipeLog: 'Wipe log',
    copied: 'Copied to clipboard',
    importPlaceholder: 'Paste exported survivor log JSON here…',
    importEmpty: 'Paste a survivor log before importing.',
    wipeConfirm: 'Wipe this survivor log forever? All kills, weapons, and progress will be lost.',
    language: 'Language',
    switchToEn: 'English',
    switchToRu: 'Русский',
  },
  errors: {
    importFailed: 'That survivor log is corrupted or from another apocalypse.',
  },
  numbers: {
    million: 'million',
    billion: 'billion',
    trillion: 'trillion',
    quadrillion: 'quadrillion',
    quintillion: 'quintillion',
    sextillion: 'sextillion',
    septillion: 'septillion',
    octillion: 'octillion',
    nonillion: 'nonillion',
    decillion: 'decillion',
  },
  buffs: {
    ...buffs,
    buildingProduction: '{building} production ×{multiplier}',
  },
  buildings,
  upgrades: {
    ...upgrades,
    cursorDescription: 'Manual strikes and baseball bats score twice as many {kills}.',
    buildingDescription: 'Doubles {building} kill rate.',
  },
  achievements,
  news: NEWS_TICKER,
}

writeFileSync(join(outDir, 'en.json'), `${JSON.stringify(en, null, 2)}\n`)
console.log('Generated en.json')
