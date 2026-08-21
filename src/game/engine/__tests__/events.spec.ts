import { describe, expect, it, beforeEach } from 'vitest'
import { createInitialState, getCookiesPerClick, tick, totalCps, triggerWorldEvent } from '@/game/engine'
import { resetWorldEventIdCounter } from '@/game/engine/events'

describe('world events', () => {
  beforeEach(() => {
    resetWorldEventIdCounter()
  })

  it('doubles cps during horde night', () => {
    let state = {
      ...createInitialState(),
      cookiesBakedAllTime: 1000,
      buildings: { ...createInitialState().buildings, grandma: 1 },
    }
    const base = totalCps(state)
    state = triggerWorldEvent(state, 'hordeNight', () => 0)
    expect(totalCps(state)).toBeCloseTo(base * 2)
  })

  it('triples click power during adrenaline rush', () => {
    let state = createInitialState()
    const base = getCookiesPerClick(state)
    state = triggerWorldEvent(state, 'adrenalineRush', () => 0)
    expect(getCookiesPerClick(state)).toBeCloseTo(base * 3)
  })

  it('schedules and fires events after threshold', () => {
    let state = createInitialState()
    state = {
      ...state,
      cookiesBakedAllTime: 600,
      nextWorldEventAt: 5,
      gameTime: 0,
    }
    state = tick(state, 6, () => 0)
    expect(state.activeEvents.length).toBeGreaterThan(0)
    expect(state.nextWorldEventAt).not.toBeNull()
  })
})
