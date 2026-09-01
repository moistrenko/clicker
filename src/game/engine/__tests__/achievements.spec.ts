import { describe, expect, it } from 'vitest'
import {
  buy,
  buyUpgrade,
  checkAchievements,
  click,
  createInitialState,
  listAchievements,
  tick,
} from '@/game/engine'

describe('achievements engine', () => {
  it('tracks total clicks on each click', () => {
    let state = createInitialState()
    state = click(state)
    expect(state.totalClicks).toBe(1)
    state = click(state)
    expect(state.totalClicks).toBe(2)
  })

  it('unlocks first-blood after the first kill', () => {
    const clicked = click(createInitialState())
    const { state, newlyUnlocked } = checkAchievements(clicked)
    expect(newlyUnlocked.map((a) => a.id)).toEqual(['first-blood'])
    expect(state.achievements).toContain('first-blood')
  })

  it('does not re-unlock achievements already earned', () => {
    let state = click(createInitialState())
    const first = checkAchievements(state)
    state = first.state
    const second = checkAchievements(state)
    expect(second.newlyUnlocked).toEqual([])
    expect(second.state.achievements).toEqual(['first-blood'])
  })

  it('unlocks bat-basics when owning a cursor', () => {
    let state = { ...createInitialState(), cookies: 100 }
    state = buy(state, 'cursor')
    const { newlyUnlocked } = checkAchievements(state)
    expect(newlyUnlocked.map((a) => a.id)).toContain('bat-basics')
  })

  it('unlocks upgrade-initiate after buying an upgrade', () => {
    let state = {
      ...createInitialState(),
      cookies: 100,
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    state = buyUpgrade(state, 'cursor-1')
    const { newlyUnlocked } = checkAchievements(state)
    expect(newlyUnlocked.map((a) => a.id)).toContain('upgrade-initiate')
  })

  it('unlocks killing-machine when cps threshold is met', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, grandma: 100 },
    }
    const { newlyUnlocked } = checkAchievements(state)
    expect(newlyUnlocked.map((a) => a.id)).toContain('killing-machine')
  })

  it('unlocks duel achievements from recorded stats', () => {
    const state = {
      ...createInitialState(),
      duelWins: 1,
      duelLosses: 0,
      duelDraws: 0,
    }
    const { newlyUnlocked } = checkAchievements(state)
    const ids = newlyUnlocked.map((a) => a.id)
    expect(ids).toContain('first-duel')
    expect(ids).toContain('duel-victor')
  })

  it('unlocks prestige achievements from survivor rank', () => {
    const state = {
      ...createInitialState(),
      prestigeLevel: 1,
    }
    const { newlyUnlocked } = checkAchievements(state)
    expect(newlyUnlocked.map((a) => a.id)).toContain('first-ascension')
  })

  it('listAchievements marks unlocked entries', () => {
    const state = {
      ...createInitialState(),
      achievements: ['first-blood'],
    }
    const listings = listAchievements(state)
    const firstBlood = listings.find((entry) => entry.achievement.id === 'first-blood')
    const freshMeat = listings.find((entry) => entry.achievement.id === 'fresh-meat')
    expect(firstBlood?.unlocked).toBe(true)
    expect(freshMeat?.unlocked).toBe(false)
    expect(listings.length).toBeGreaterThanOrEqual(40)
  })

  it('unlocks click-based achievements from totalClicks', () => {
    const state = {
      ...createInitialState(),
      totalClicks: 100,
    }
    const { newlyUnlocked } = checkAchievements(state)
    expect(newlyUnlocked.map((a) => a.id)).toContain('finger-workout')
  })

  it('can unlock via tick-driven total kills', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, grandma: 1 },
    }
    const ticked = tick(state, 1)
    const { newlyUnlocked } = checkAchievements(ticked)
    expect(newlyUnlocked.map((a) => a.id)).toContain('first-blood')
  })
})
