import { describe, expect, it } from 'vitest'
import {
  buy,
  buildingPrice,
  canBuy,
  click,
  createInitialState,
  tick,
  totalCps,
} from '@/game/engine'

describe('game engine', () => {
  it('click increases cookies and all-time baked', () => {
    const next = click(createInitialState())
    expect(next.cookies).toBe(1)
    expect(next.cookiesBakedAllTime).toBe(1)
    expect(next.cookiesPerClick).toBe(1)
  })

  it('buying cursor at 0 owned costs 15, then next costs ceil(15 * 1.15)', () => {
    let state = createInitialState()
    state = { ...state, cookies: 100 }

    expect(buildingPrice(15, 0)).toBe(15)
    state = buy(state, 'cursor')
    expect(state.buildings.cursor).toBe(1)
    expect(state.cookies).toBe(85)
    expect(buildingPrice(15, 1)).toBe(Math.ceil(15 * 1.15))
    expect(buildingPrice(15, 1)).toBe(18)
  })

  it('cannot buy without enough cookies; cookies unchanged', () => {
    const state = createInitialState()
    expect(canBuy(state, 'cursor')).toBe(false)
    const next = buy(state, 'cursor')
    expect(next).toBe(state)
    expect(next.cookies).toBe(0)
    expect(next.buildings.cursor).toBe(0)
  })

  it('CpS is 0.1 with 1 cursor, 1.1 with 1 cursor + 1 grandma', () => {
    const withCursor = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    expect(totalCps(withCursor)).toBeCloseTo(0.1)

    const withBoth = {
      ...withCursor,
      buildings: { ...withCursor.buildings, grandma: 1 },
    }
    expect(totalCps(withBoth)).toBeCloseTo(1.1)
  })

  it('tick(1 second) with 1 grandma adds ~1 cookie', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, grandma: 1 },
    }
    const next = tick(state, 1)
    expect(next.cookies).toBeCloseTo(1)
    expect(next.cookiesBakedAllTime).toBeCloseTo(1)
  })

  it('price formula for n=0,1,10', () => {
    expect(buildingPrice(15, 0)).toBe(15)
    expect(buildingPrice(15, 1)).toBe(18)
    expect(buildingPrice(15, 10)).toBe(Math.ceil(15 * Math.pow(1.15, 10)))
    expect(buildingPrice(15, 10)).toBe(61)
  })
})
