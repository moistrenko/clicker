import { describe, expect, it } from 'vitest'
import { OFFLINE_MAX_SECONDS } from '@/game/catalog/offline'
import { createInitialState } from '@/game/engine'
import { loadGame, parseSave, saveGame, STORAGE_KEY } from '@/game/persist/storage'
import { SAVE_VERSION } from '@/game/types'

function createMemoryStorage(initial?: Record<string, string>) {
  const map = new Map(Object.entries(initial ?? {}))
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
  }
}

describe('save persistence', () => {
  it('migrates a v1 save without upgrades to the current version', () => {
    const raw = JSON.stringify({
      version: 1,
      cookies: 50,
      cookiesBakedAllTime: 80,
      cookiesPerClick: 1,
      buildings: { cursor: 2, grandma: 1 },
    })
    const parsed = parseSave(raw)
    expect(parsed).not.toBeNull()
    expect(parsed?.version).toBe(SAVE_VERSION)
    expect(parsed?.version).toBe(6)
    expect(parsed?.upgrades).toEqual([])
    expect(parsed?.totalClicks).toBe(0)
    expect(parsed?.achievements).toEqual([])
    expect(parsed?.cookies).toBe(50)
    expect(parsed?.cookiesBakedAllTime).toBe(80)
    expect(parsed?.buildings.cursor).toBe(2)
    expect(parsed?.buildings.grandma).toBe(1)
    expect(parsed?.cookiesPerClick).toBe(1)
    expect(parsed?.activeBuffs).toEqual([])
    expect(parsed?.goldenCookie).toBeNull()
    expect(parsed?.lastSavedAt).toBe(0)
  })

  it('loads v2 upgrades and ignores unknown ids', () => {
    const raw = JSON.stringify({
      version: 2,
      cookies: 10,
      cookiesBakedAllTime: 200,
      buildings: { cursor: 1 },
      upgrades: ['cursor-1', 'not-real', 'cursor-1'],
    })
    const parsed = parseSave(raw)
    expect(parsed?.upgrades).toEqual(['cursor-1'])
    expect(parsed?.cookiesPerClick).toBe(2)
    expect(parsed?.version).toBe(6)
    expect(parsed?.totalClicks).toBe(0)
    expect(parsed?.achievements).toEqual([])
    expect(parsed?.gameTime).toBe(0)
  })

  it('migrates a v3 save with default clicks and achievements', () => {
    const raw = JSON.stringify({
      version: 3,
      cookies: 1000,
      cookiesBakedAllTime: 5000,
      buildings: { grandma: 2 },
      upgrades: ['cursor-1'],
      gameTime: 100,
      activeBuffs: [
        {
          id: 'buff-live',
          type: 'clickFrenzy',
          multiplier: 777,
          expiresAt: 120,
        },
      ],
      goldenCookie: { x: 0.2, y: 0.8 },
      nextGoldenSpawnAt: 140,
    })
    const parsed = parseSave(raw)
    expect(parsed?.version).toBe(6)
    expect(parsed?.totalClicks).toBe(0)
    expect(parsed?.achievements).toEqual([])
    expect(parsed?.activeBuffs).toHaveLength(1)
    expect(parsed?.activeBuffs[0]?.id).toBe('buff-live')
    expect(parsed?.goldenCookie).toBeNull()
    expect(parsed?.nextGoldenSpawnAt).toBe(140)
  })

  it('loads v4 achievements and click counts', () => {
    const raw = JSON.stringify({
      version: 4,
      cookies: 50,
      cookiesBakedAllTime: 200,
      totalClicks: 42,
      buildings: { cursor: 1 },
      upgrades: [],
      achievements: ['first-blood', 'not-real', 'first-blood'],
      gameTime: 0,
      activeBuffs: [],
      goldenCookie: null,
      nextGoldenSpawnAt: null,
    })
    const parsed = parseSave(raw)
    expect(parsed?.totalClicks).toBe(42)
    expect(parsed?.achievements).toEqual(['first-blood'])
    expect(parsed?.version).toBe(6)
    expect(parsed?.prestigeLevel).toBe(0)
    expect(parsed?.lifetimeKills).toBe(0)
  })

  it('loads v5 prestige fields and defaults lastSavedAt to zero', () => {
    const raw = JSON.stringify({
      version: 5,
      cookies: 100,
      cookiesBakedAllTime: 200,
      totalClicks: 10,
      buildings: { cursor: 1 },
      upgrades: [],
      achievements: [],
      gameTime: 0,
      activeBuffs: [],
      goldenCookie: null,
      nextGoldenSpawnAt: null,
      prestigeLevel: 3,
      lifetimeKills: 4_000_000,
    })
    const parsed = parseSave(raw)
    expect(parsed?.version).toBe(6)
    expect(parsed?.prestigeLevel).toBe(3)
    expect(parsed?.lifetimeKills).toBe(4_000_000)
    expect(parsed?.lastSavedAt).toBe(0)
  })

  it('loads v6 lastSavedAt', () => {
    const raw = JSON.stringify({
      version: 6,
      cookies: 100,
      cookiesBakedAllTime: 200,
      totalClicks: 10,
      buildings: { cursor: 1 },
      upgrades: [],
      achievements: [],
      gameTime: 0,
      activeBuffs: [],
      goldenCookie: null,
      nextGoldenSpawnAt: null,
      prestigeLevel: 0,
      lifetimeKills: 0,
      lastSavedAt: 1_700_000_000_000,
    })
    const parsed = parseSave(raw)
    expect(parsed?.version).toBe(6)
    expect(parsed?.lastSavedAt).toBe(1_700_000_000_000)
  })

  it('rejects unsupported save versions', () => {
    expect(parseSave(JSON.stringify({ version: 0, cookies: 1 }))).toBeNull()
    expect(parseSave(JSON.stringify({ version: 7, cookies: 1 }))).toBeNull()
  })

  it('saveGame stamps lastSavedAt onto the stored payload', () => {
    const storage = createMemoryStorage()
    const now = 1_700_000_000_000
    saveGame({ ...createInitialState(), cookies: 12 }, storage)
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as { lastSavedAt?: number }
    expect(saved.lastSavedAt).toBeTypeOf('number')
    expect(saved.lastSavedAt).toBeGreaterThanOrEqual(now - 5000)
  })

  it('loadGame applies offline progress and reports kills gained', () => {
    const now = 1_700_000_000_000
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 6,
        cookies: 0,
        cookiesBakedAllTime: 200,
        cookiesPerClick: 1,
        totalClicks: 0,
        buildings: { ...createInitialState().buildings, cursor: 1 },
        upgrades: [],
        achievements: [],
        gameTime: 0,
        activeBuffs: [],
        goldenCookie: null,
        nextGoldenSpawnAt: null,
        prestigeLevel: 0,
        lifetimeKills: 0,
        lastSavedAt: now - 100_000,
      }),
    })

    const result = loadGame(storage, now)
    expect(result.offlineKills).toBeCloseTo(10)
    expect(result.state.cookies).toBeCloseTo(10)
    expect(result.state.lastSavedAt).toBe(now)
  })

  it('loadGame skips offline progress beyond the cap', () => {
    const now = 1_700_000_000_000
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 6,
        cookies: 0,
        cookiesBakedAllTime: 200,
        cookiesPerClick: 1,
        totalClicks: 0,
        buildings: { ...createInitialState().buildings, cursor: 1 },
        upgrades: [],
        achievements: [],
        gameTime: 0,
        activeBuffs: [],
        goldenCookie: null,
        nextGoldenSpawnAt: null,
        prestigeLevel: 0,
        lifetimeKills: 0,
        lastSavedAt: now - OFFLINE_MAX_SECONDS * 1000 - 120_000,
      }),
    })

    const result = loadGame(storage, now)
    expect(result.offlineKills).toBeCloseTo(OFFLINE_MAX_SECONDS * 0.1)
  })
})
