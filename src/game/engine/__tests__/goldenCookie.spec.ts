import { describe, expect, it } from 'vitest'
import {
  clickGoldenCookie,
  createInitialState,
  ensureGoldenSpawnScheduled,
  expireBuffs,
  getActiveBuffs,
  getCookiesPerClick,
  luckyBonus,
  nextGoldenSpawnInterval,
  resetBuffIdCounter,
  tick,
  totalCps,
  updateGoldenCookieSpawn,
} from '@/game/engine'
import {
  CLICK_FRENZY_DURATION_SECONDS,
  CLICK_FRENZY_MULTIPLIER,
  FRENZY_DURATION_SECONDS,
  FRENZY_MULTIPLIER,
  GOLDEN_COOKIE_MIN_BAKED,
  GOLDEN_SPAWN_JITTER_MIN,
  GOLDEN_SPAWN_MEAN_SECONDS,
} from '@/game/catalog/goldenCookies'
import type { GameState } from '@/game/types'

describe('golden cookies', () => {
  it('does not schedule spawns before 100 cookies baked all-time', () => {
    const state = createInitialState()
    const next = ensureGoldenSpawnScheduled(state)
    expect(next.nextGoldenSpawnAt).toBeNull()
  })

  it('schedules the next spawn after reaching the baked threshold', () => {
    resetBuffIdCounter()
    const rng = () => 0
    const state: GameState = {
      ...createInitialState(),
      cookiesBakedAllTime: GOLDEN_COOKIE_MIN_BAKED,
      gameTime: 10,
    }
    const next = ensureGoldenSpawnScheduled(state, rng)
    expect(next.nextGoldenSpawnAt).toBe(10 + nextGoldenSpawnInterval(rng))
  })

  it('uses randomized spawn intervals within the expected range', () => {
    const minInterval = nextGoldenSpawnInterval(() => 0)
    const maxInterval = nextGoldenSpawnInterval(() => 1)
    expect(minInterval).toBe(GOLDEN_SPAWN_MEAN_SECONDS * GOLDEN_SPAWN_JITTER_MIN)
    expect(maxInterval).toBeCloseTo(GOLDEN_SPAWN_MEAN_SECONDS * 1.5)
  })

  it('spawns one visible golden cookie when the timer elapses', () => {
    resetBuffIdCounter()
    let state: GameState = {
      ...createInitialState(),
      cookiesBakedAllTime: 200,
      gameTime: 50,
      nextGoldenSpawnAt: 50,
    }
    state = updateGoldenCookieSpawn(state, () => 0.4)
    expect(state.goldenCookie).not.toBeNull()
    expect(state.nextGoldenSpawnAt).toBeNull()
  })

  it('does not spawn while a golden cookie is already visible', () => {
    const state: GameState = {
      ...createInitialState(),
      cookiesBakedAllTime: 200,
      gameTime: 60,
      goldenCookie: { x: 0.2, y: 0.3 },
      nextGoldenSpawnAt: 60,
    }
    const next = updateGoldenCookieSpawn(state, () => 0)
    expect(next.goldenCookie).toEqual({ x: 0.2, y: 0.3 })
  })

  it('clicking a golden cookie applies an effect and clears the spawn', () => {
    resetBuffIdCounter()
    let state: GameState = {
      ...createInitialState(),
      cookiesBakedAllTime: 200,
      gameTime: 12,
      goldenCookie: { x: 0.25, y: 0.35 },
    }
    let rngCalls = 0
    const rng = () => {
      rngCalls += 1
      return rngCalls === 1 ? 0.01 : 0.5
    }
    state = clickGoldenCookie(state, rng)
    expect(state.goldenCookie).toBeNull()
    expect(state.nextGoldenSpawnAt).toBeGreaterThan(state.gameTime)
    expect(getActiveBuffs(state)).toHaveLength(1)
    expect(getActiveBuffs(state)[0]?.type).toBe('frenzy')
  })

  it('frenzy multiplies total CpS', () => {
    resetBuffIdCounter()
    const state: GameState = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, grandma: 1 },
      gameTime: 5,
      activeBuffs: [
        {
          id: 'buff-1',
          type: 'frenzy',
          multiplier: FRENZY_MULTIPLIER,
          expiresAt: 5 + FRENZY_DURATION_SECONDS,
        },
      ],
    }
    expect(totalCps(state)).toBeCloseTo(8.4)
  })

  it('click frenzy multiplies cookies per click', () => {
    resetBuffIdCounter()
    const state: GameState = {
      ...createInitialState(),
      gameTime: 3,
      activeBuffs: [
        {
          id: 'buff-1',
          type: 'clickFrenzy',
          multiplier: CLICK_FRENZY_MULTIPLIER,
          expiresAt: 3 + CLICK_FRENZY_DURATION_SECONDS,
        },
      ],
    }
    expect(getCookiesPerClick(state)).toBe(CLICK_FRENZY_MULTIPLIER)
  })

  it('lucky grants an instant cookie bonus', () => {
    resetBuffIdCounter()
    let state: GameState = {
      ...createInitialState(),
      cookies: 200,
      cookiesBakedAllTime: 500,
      gameTime: 8,
      goldenCookie: { x: 0.4, y: 0.2 },
    }
    let rngCalls = 0
    const rng = () => {
      rngCalls += 1
      return rngCalls === 1 ? 0.35 : 0.5
    }
    const bonus = luckyBonus(state.cookies)
    state = clickGoldenCookie(state, rng)
    expect(getActiveBuffs(state)).toHaveLength(0)
    expect(state.cookies).toBe(200 + bonus)
    expect(state.cookiesBakedAllTime).toBe(500 + bonus)
  })

  it('building special falls back to frenzy when no buildings are owned', () => {
    resetBuffIdCounter()
    let state: GameState = {
      ...createInitialState(),
      cookiesBakedAllTime: 150,
      gameTime: 4,
      goldenCookie: { x: 0.7, y: 0.2 },
    }
    let rngCalls = 0
    const rng = () => {
      rngCalls += 1
      return rngCalls === 1 ? 0.95 : 0.5
    }
    state = clickGoldenCookie(state, rng)
    expect(getActiveBuffs(state)[0]?.type).toBe('frenzy')
  })

  it('expires buffs after their duration during tick', () => {
    resetBuffIdCounter()
    let state: GameState = {
      ...createInitialState(),
      gameTime: 0,
      activeBuffs: [
        {
          id: 'buff-1',
          type: 'frenzy',
          multiplier: FRENZY_MULTIPLIER,
          expiresAt: 10,
        },
      ],
    }
    state = tick(state, 10)
    expect(state.gameTime).toBe(10)
    expect(getActiveBuffs(state)).toHaveLength(0)
  })

  it('expireBuffs removes only expired entries', () => {
    const state: GameState = {
      ...createInitialState(),
      gameTime: 20,
      activeBuffs: [
        {
          id: 'buff-1',
          type: 'frenzy',
          expiresAt: 10,
        },
        {
          id: 'buff-2',
          type: 'clickFrenzy',
          expiresAt: 30,
        },
      ],
    }
    const next = expireBuffs(state)
    expect(getActiveBuffs(next)).toHaveLength(1)
    expect(getActiveBuffs(next)[0]?.id).toBe('buff-2')
  })
})
