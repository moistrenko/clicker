import { describe, expect, it } from 'vitest'
import {
  ascend,
  ASCEND_THRESHOLD,
  canAscend,
  createInitialState,
  getCookiesPerClick,
  prestigeMultiplier,
  projectAscendGain,
  rankFromKills,
  totalCps,
  totalLifetimeKills,
} from '@/game/engine'

describe('prestige engine', () => {
  it('rankFromKills returns 0 below threshold and 1 at 1M kills', () => {
    expect(rankFromKills(ASCEND_THRESHOLD - 1)).toBe(0)
    expect(rankFromKills(ASCEND_THRESHOLD)).toBe(1)
    expect(rankFromKills(4_000_000)).toBe(2)
  })

  it('prestigeMultiplier scales +1% per rank', () => {
    expect(prestigeMultiplier({ ...createInitialState(), prestigeLevel: 0 })).toBe(1)
    expect(prestigeMultiplier({ ...createInitialState(), prestigeLevel: 5 })).toBeCloseTo(1.05)
    expect(prestigeMultiplier({ ...createInitialState(), prestigeLevel: 10 })).toBeCloseTo(1.1)
  })

  it('projectAscendGain reflects ranks earned from lifetime kills', () => {
    const ready = {
      ...createInitialState(),
      cookiesBakedAllTime: ASCEND_THRESHOLD,
    }
    expect(totalLifetimeKills(ready)).toBe(ASCEND_THRESHOLD)
    expect(projectAscendGain(ready)).toBe(1)
    expect(canAscend(ready)).toBe(true)

    const partial = {
      ...createInitialState(),
      cookiesBakedAllTime: ASCEND_THRESHOLD / 2,
    }
    expect(projectAscendGain(partial)).toBe(0)
    expect(canAscend(partial)).toBe(false)
  })

  it('projectAscendGain counts stacked lifetime and current-run kills', () => {
    const state = {
      ...createInitialState(),
      prestigeLevel: 1,
      lifetimeKills: ASCEND_THRESHOLD,
      cookiesBakedAllTime: 3_000_000,
    }
    expect(projectAscendGain(state)).toBe(1)
  })

  it('ascend resets run progress but keeps achievements and prestige', () => {
    const before = {
      ...createInitialState(),
      cookies: 500_000,
      cookiesBakedAllTime: ASCEND_THRESHOLD,
      totalClicks: 900,
      buildings: { ...createInitialState().buildings, cursor: 5, grandma: 2 },
      upgrades: ['cursor-1'],
      achievements: ['first-blood'],
      gameTime: 120,
      activeBuffs: [
        {
          id: 'buff-1',
          type: 'frenzy' as const,
          multiplier: 7,
          expiresAt: 200,
        },
      ],
      goldenCookie: { x: 0.5, y: 0.5 },
      nextGoldenSpawnAt: 150,
    }

    const after = ascend(before)
    expect(after).not.toBe(before)
    expect(after.cookies).toBe(0)
    expect(after.cookiesBakedAllTime).toBe(0)
    expect(after.totalClicks).toBe(0)
    expect(after.buildings.cursor).toBe(0)
    expect(after.upgrades).toEqual([])
    expect(after.gameTime).toBe(0)
    expect(after.activeBuffs).toEqual([])
    expect(after.goldenCookie).toBeNull()
    expect(after.nextGoldenSpawnAt).toBeNull()
    expect(after.achievements).toEqual(['first-blood'])
    expect(after.prestigeLevel).toBe(1)
    expect(after.lifetimeKills).toBe(ASCEND_THRESHOLD)
  })

  it('ascend is a no-op when no rank would be gained', () => {
    const state = {
      ...createInitialState(),
      cookiesBakedAllTime: 500_000,
    }
    expect(ascend(state)).toBe(state)
  })

  it('prestige bonus applies to CpS and click power', () => {
    const base = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    const boosted = {
      ...base,
      prestigeLevel: 10,
    }
    expect(totalCps(boosted)).toBeCloseTo(totalCps(base) * 1.1)
    expect(getCookiesPerClick(boosted)).toBeCloseTo(getCookiesPerClick(base) * 1.1)
  })
})
