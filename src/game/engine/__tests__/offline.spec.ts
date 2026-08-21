import { describe, expect, it } from 'vitest'
import { OFFLINE_MAX_SECONDS } from '@/game/catalog/offline'
import {
  applyOfflineProgress,
  computeOfflineSeconds,
  tickOffline,
} from '@/game/engine/offline'
import { createInitialState, totalCps } from '@/game/engine'
import { ensureGoldenSpawnScheduled } from '@/game/engine/goldenCookie'

describe('offline progress', () => {
  it('returns zero offline seconds when lastSavedAt is missing or in the future', () => {
    const now = 1_700_000_000_000
    expect(computeOfflineSeconds(0, now)).toBe(0)
    expect(computeOfflineSeconds(now, now)).toBe(0)
    expect(computeOfflineSeconds(now + 1000, now)).toBe(0)
  })

  it('caps offline seconds at eight hours', () => {
    const now = 1_700_000_000_000
    const lastSavedAt = now - OFFLINE_MAX_SECONDS * 1000 - 60_000
    expect(computeOfflineSeconds(lastSavedAt, now)).toBe(OFFLINE_MAX_SECONDS)
  })

  it('computes elapsed offline seconds below the cap', () => {
    const now = 1_700_000_000_000
    const lastSavedAt = now - 90_000
    expect(computeOfflineSeconds(lastSavedAt, now)).toBe(90)
  })

  it('tickOffline grants kills from cps without scheduling golden cookies', () => {
    const state = {
      ...createInitialState(),
      cookiesBakedAllTime: 200,
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    const next = tickOffline(state, 10)
    expect(totalCps(state)).toBeCloseTo(0.15)
    expect(next.cookies).toBeCloseTo(1.5)
    expect(next.cookiesBakedAllTime).toBeCloseTo(201.5)
    expect(next.gameTime).toBe(10)
    expect(next.goldenCookie).toBeNull()
    expect(next.nextGoldenSpawnAt).toBeNull()
  })

  it('applyOfflineProgress returns kills gained while away', () => {
    const now = 1_700_000_000_000
    const state = {
      ...createInitialState(),
      cookies: 5,
      cookiesBakedAllTime: 200,
      lastSavedAt: now - 100_000,
      buildings: { ...createInitialState().buildings, cursor: 1 },
    }
    const result = applyOfflineProgress(state, now)
    expect(result.offlineKills).toBeCloseTo(15)
    expect(result.state.cookies).toBeCloseTo(20)
  })

  it('does not spawn golden cookies during offline catch-up', () => {
    const now = 1_700_000_000_000
    const state = ensureGoldenSpawnScheduled({
      ...createInitialState(),
      cookiesBakedAllTime: 500,
      lastSavedAt: now - 60_000,
      buildings: { ...createInitialState().buildings, cursor: 1 },
    })
    const result = applyOfflineProgress(state, now)
    expect(result.offlineKills).toBeGreaterThan(0)
    expect(result.state.goldenCookie).toBeNull()
  })
})
