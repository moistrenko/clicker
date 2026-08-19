import { describe, expect, it } from 'vitest'
import {
  buy,
  buyUpgrade,
  buildingPrice,
  canBuy,
  click,
  createInitialState,
  getCookiesPerClick,
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

  it('1 cursor is 0.1 CpS without upgrades', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    expect(totalCps(state)).toBeCloseTo(0.1)
    expect(getCookiesPerClick(state)).toBe(1)
  })

  it('buying cursor-1 doubles cursor CpS and cookies per click', () => {
    let state = {
      ...createInitialState(),
      cookies: 100,
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    state = buyUpgrade(state, 'cursor-1')
    expect(state.upgrades).toEqual(['cursor-1'])
    expect(state.cookies).toBe(0)
    expect(totalCps(state)).toBeCloseTo(0.2)
    expect(getCookiesPerClick(state)).toBe(2)
    expect(state.cookiesPerClick).toBe(2)

    const clicked = click(state)
    expect(clicked.cookies).toBeCloseTo(2)
  })

  it('all 3 cursor click upgrades make cookiesPerClick 8 and 1 cursor 0.8 CpS', () => {
    const state = {
      ...createInitialState(),
      upgrades: ['cursor-1', 'cursor-2', 'cursor-3'],
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    expect(getCookiesPerClick(state)).toBe(8)
    expect(totalCps(state)).toBeCloseTo(0.8)
  })

  it('grandma double upgrade doubles grandma CpS from 1 to 2', () => {
    let state = {
      ...createInitialState(),
      cookies: 1000,
      buildings: { ...createInitialState().buildings, grandma: 1 },
    }
    expect(totalCps(state)).toBeCloseTo(1)
    state = buyUpgrade(state, 'grandma-1')
    expect(totalCps(state)).toBeCloseTo(2)
    expect(getCookiesPerClick(state)).toBe(1)
  })

  it('cannot buy an upgrade if unaffordable, locked, already owned, or unknown', () => {
    const unaffordable = {
      ...createInitialState(),
      cookies: 99,
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    expect(buyUpgrade(unaffordable, 'cursor-1')).toBe(unaffordable)

    const locked = {
      ...createInitialState(),
      cookies: 10_000,
    }
    expect(buyUpgrade(locked, 'cursor-1')).toBe(locked)

    let owned = {
      ...createInitialState(),
      cookies: 500,
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    owned = buyUpgrade(owned, 'cursor-1')
    const alreadyOwned = buyUpgrade({ ...owned, cookies: 500 }, 'cursor-1')
    expect(alreadyOwned.upgrades).toEqual(['cursor-1'])
    expect(alreadyOwned.cookies).toBe(500)

    const unknown = {
      ...createInitialState(),
      cookies: 999,
    }
    expect(buyUpgrade(unknown, 'not-a-real-upgrade')).toBe(unknown)
  })

  it('tick uses multiplied CpS after an upgrade', () => {
    const state = {
      ...createInitialState(),
      upgrades: ['grandma-1'],
      buildings: { ...createInitialState().buildings, grandma: 1 },
    }
    const next = tick(state, 1)
    expect(next.cookies).toBeCloseTo(2)
    expect(next.cookiesBakedAllTime).toBeCloseTo(2)
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
