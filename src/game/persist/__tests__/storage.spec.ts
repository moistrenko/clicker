import { describe, expect, it } from 'vitest'
import { SAVE_VERSION } from '@/game/types'
import { parseSave } from '@/game/persist/storage'

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
    expect(parsed?.version).toBe(4)
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
    expect(parsed?.version).toBe(4)
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
    expect(parsed?.version).toBe(4)
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
    expect(parsed?.version).toBe(4)
  })

  it('rejects unsupported save versions', () => {
    expect(parseSave(JSON.stringify({ version: 0, cookies: 1 }))).toBeNull()
    expect(parseSave(JSON.stringify({ version: 5, cookies: 1 }))).toBeNull()
  })
})
