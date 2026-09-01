import { describe, expect, it } from 'vitest'
import {
  ascend,
  ASCEND_THRESHOLD,
  canAscend,
  createInitialState,
  getCookiesPerClick,
  killsRequiredForRank,
  normalizePrestigeLevel,
  prestigeMultiplier,
  projectAscendGain,
  rankFromKills,
  totalCps,
  totalLifetimeKills,
} from '@/game/engine'

describe('prestige engine', () => {
  it('killsRequiredForRank soft-caps tier growth for high ranks', () => {
    expect(killsRequiredForRank(0)).toBe(ASCEND_THRESHOLD)
    expect(killsRequiredForRank(1)).toBe(ASCEND_THRESHOLD * 5)
    expect(killsRequiredForRank(22)).toBe(killsRequiredForRank(100))
  })

  it('rankFromKills uses escalating lifetime kill tiers', () => {
    expect(rankFromKills(ASCEND_THRESHOLD - 1)).toBe(0)
    expect(rankFromKills(ASCEND_THRESHOLD)).toBe(1)
    expect(rankFromKills(ASCEND_THRESHOLD + killsRequiredForRank(1) - 1)).toBe(1)
    expect(rankFromKills(ASCEND_THRESHOLD + killsRequiredForRank(1))).toBe(2)
  })

  it('prestigeMultiplier grows linearly but is capped', () => {
    expect(prestigeMultiplier({ ...createInitialState(), prestigeLevel: 0 })).toBe(1)
    expect(prestigeMultiplier({ ...createInitialState(), prestigeLevel: 10 })).toBeCloseTo(1.3)
    expect(prestigeMultiplier({ ...createInitialState(), prestigeLevel: 100 })).toBe(3)
  })

  it('projectAscendGain only counts kills from the current run', () => {
    const ready = {
      ...createInitialState(),
      cookiesBakedAllTime: ASCEND_THRESHOLD,
    }
    expect(projectAscendGain(ready)).toBe(1)
    expect(canAscend(ready)).toBe(true)

    const partial = {
      ...createInitialState(),
      cookiesBakedAllTime: ASCEND_THRESHOLD / 2,
    }
    expect(projectAscendGain(partial)).toBe(0)
    expect(canAscend(partial)).toBe(false)
  })

  it('projectAscendGain ignores banked lifetime kills', () => {
    const state = {
      ...createInitialState(),
      prestigeLevel: 1,
      lifetimeKills: ASCEND_THRESHOLD * 100,
      cookiesBakedAllTime: 3_000_000,
    }
    expect(projectAscendGain(state)).toBe(0)
  })

  it('projectAscendGain can award multiple ranks from one strong run', () => {
    const state = {
      ...createInitialState(),
      cookiesBakedAllTime: ASCEND_THRESHOLD + killsRequiredForRank(1) + killsRequiredForRank(2),
    }
    expect(projectAscendGain(state)).toBe(3)
  })

  it('projectAscendGain is capped per run', () => {
    const state = {
      ...createInitialState(),
      prestigeLevel: 30,
      cookiesBakedAllTime: 1e40,
    }
    expect(projectAscendGain(state)).toBe(5)
  })

  it('ascend resets run progress but adds earned ranks', () => {
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
      duelWins: 2,
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
    expect(after.duelWins).toBe(2)
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
    expect(totalCps(boosted)).toBeCloseTo(totalCps(base) * 1.3)
    expect(getCookiesPerClick(boosted)).toBeCloseTo(getCookiesPerClick(base) * 1.3)
  })

  it('normalizePrestigeLevel clamps inflated legacy prestige', () => {
    const lifetimeKills = 2.335e36
    expect(normalizePrestigeLevel(136, lifetimeKills)).toBe(rankFromKills(lifetimeKills))
    expect(normalizePrestigeLevel(12, lifetimeKills)).toBe(12)
  })
})
