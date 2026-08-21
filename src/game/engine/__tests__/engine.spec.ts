import { describe, expect, it } from 'vitest'
import {
  buy,
  buyUpgrade,
  buildingCpsEach,
  buildingCpsTotal,
  buildingPrice,
  bulkBuildingPrice,
  maxAffordableBuildingCount,
  canBuy,
  click,
  createInitialState,
  getCookiesPerClick,
  listStoreBuildings,
  listStoreUpgrades,
  tick,
  totalCps,
  upgradeClickGain,
  upgradeCpsGain,
} from '@/game/engine'
import { getUpgrade } from '@/game/catalog/upgrades'
import { resolveBuyBulk } from '@/composables/useBuyBulk'

describe('game engine', () => {
  it('click increases cookies and all-time baked', () => {
    const next = click(createInitialState())
    expect(next.cookies).toBe(1)
    expect(next.cookiesBakedAllTime).toBe(1)
    expect(next.cookiesPerClick).toBe(1)
    expect(next.totalClicks).toBe(1)
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

  it('CpS is 0.15 with 1 cursor, 1.35 with 1 cursor + 1 grandma', () => {
    const withCursor = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    expect(totalCps(withCursor)).toBeCloseTo(0.15)

    const withBoth = {
      ...withCursor,
      buildings: { ...withCursor.buildings, grandma: 1 },
    }
    expect(totalCps(withBoth)).toBeCloseTo(1.35)
  })

  it('1 cursor is 0.15 CpS without upgrades', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    expect(totalCps(state)).toBeCloseTo(0.15)
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
    expect(totalCps(state)).toBeCloseTo(0.3)
    expect(getCookiesPerClick(state)).toBe(2)
    expect(state.cookiesPerClick).toBe(2)

    const clicked = click(state)
    expect(clicked.cookies).toBeCloseTo(2)
  })

  it('all 3 cursor click upgrades make cookiesPerClick 8 and 1 cursor 1.2 CpS', () => {
    const state = {
      ...createInitialState(),
      upgrades: ['cursor-1', 'cursor-2', 'cursor-3'],
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    expect(getCookiesPerClick(state)).toBe(8)
    expect(totalCps(state)).toBeCloseTo(1.2)
  })

  it('grandma double upgrade doubles grandma CpS from 1.2 to 2.4', () => {
    let state = {
      ...createInitialState(),
      cookies: 1000,
      buildings: { ...createInitialState().buildings, grandma: 1 },
    }
    expect(totalCps(state)).toBeCloseTo(1.2)
    state = buyUpgrade(state, 'grandma-1')
    expect(totalCps(state)).toBeCloseTo(2.4)
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
    expect(next.cookies).toBeCloseTo(2.4)
    expect(next.cookiesBakedAllTime).toBeCloseTo(2.4)
  })

  it('tick(1 second) with 1 grandma adds ~1.2 cookies', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, grandma: 1 },
    }
    const next = tick(state, 1)
    expect(next.cookies).toBeCloseTo(1.2)
    expect(next.cookiesBakedAllTime).toBeCloseTo(1.2)
  })

  it('price formula for n=0,1,10', () => {
    expect(buildingPrice(15, 0)).toBe(15)
    expect(buildingPrice(15, 1)).toBe(18)
    expect(buildingPrice(15, 10)).toBe(Math.ceil(15 * Math.pow(1.15, 10)))
    expect(buildingPrice(15, 10)).toBe(61)
  })

  it('exposes per-weapon and total cps for store listings', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, cursor: 2 },
    }
    expect(buildingCpsEach(state, 'cursor')).toBeCloseTo(0.15)
    expect(buildingCpsTotal(state, 'cursor')).toBeCloseTo(0.3)

    const listing = listStoreBuildings(state).find((entry) => entry.building.id === 'cursor')
    expect(listing?.cpsEach).toBeCloseTo(0.15)
    expect(listing?.cpsTotal).toBeCloseTo(0.3)
  })

  it('preview upgrade gains for cps and click power', () => {
    const state = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, cursor: 1 },
      cookies: 500,
    }
    const upgrade = getUpgrade('cursor-1')
    expect(upgrade).toBeTruthy()
    if (!upgrade) {
      return
    }
    expect(upgradeCpsGain(state, upgrade)).toBeCloseTo(0.15)
    expect(upgradeClickGain(state, upgrade)).toBe(1)

    const listing = listStoreUpgrades(state).find((entry) => entry.upgrade.id === 'cursor-1')
    expect(listing?.cpsGain).toBeCloseTo(0.15)
    expect(listing?.clickGain).toBe(1)
  })

  it('buys buildings in bulk and charges the summed price curve', () => {
    let state = { ...createInitialState(), cookies: 10_000 }
    const expected = bulkBuildingPrice(15, 0, 10)
    expect(expected).toBe(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((sum, owned) => sum + buildingPrice(15, owned), 0),
    )
    expect(canBuy(state, 'cursor', 10)).toBe(true)
    state = buy(state, 'cursor', 10)
    expect(state.buildings.cursor).toBe(10)
    expect(state.cookies).toBe(10_000 - expected)
  })

  it('resolves keyboard buy bulk modifiers', () => {
    expect(resolveBuyBulk({ shiftKey: true, altKey: false, ctrlKey: false, metaKey: false })).toBe(10)
    expect(resolveBuyBulk({ shiftKey: false, altKey: true, ctrlKey: false, metaKey: false })).toBe(20)
    expect(resolveBuyBulk({ shiftKey: true, altKey: false, ctrlKey: true, metaKey: false })).toBe('max')
    expect(resolveBuyBulk({ shiftKey: false, altKey: false, ctrlKey: false, metaKey: true })).toBe('max')
    expect(resolveBuyBulk({ shiftKey: false, altKey: false, ctrlKey: false, metaKey: false })).toBe(1)
  })

  it('buys as many buildings as the budget allows', () => {
    const count = maxAffordableBuildingCount(15, 0, 100)
    expect(count).toBeGreaterThan(1)
    expect(bulkBuildingPrice(15, 0, count)).toBeLessThanOrEqual(100)
    expect(bulkBuildingPrice(15, 0, count + 1)).toBeGreaterThan(100)

    let state = { ...createInitialState(), cookies: 100 }
    state = buy(state, 'cursor', count)
    expect(state.buildings.cursor).toBe(count)
    expect(state.cookies).toBe(100 - bulkBuildingPrice(15, 0, count))
    expect(maxAffordableBuildingCount(15, 0, 0)).toBe(0)
    expect(maxAffordableBuildingCount(15, 0, 14)).toBe(0)
  })
})
