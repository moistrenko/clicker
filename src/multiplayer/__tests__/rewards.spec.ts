import { describe, expect, it } from 'vitest'
import { createInitialState } from '@/game/engine'
import { applyDuelReward } from '@/multiplayer/rewards'
import { computeSettleRewards } from '@/multiplayer/types'

describe('duel rewards', () => {
  it('adds reward kills into the main save cookies and baked totals', () => {
    const main = {
      ...createInitialState(),
      cookies: 100,
      cookiesBakedAllTime: 500,
    }
    const next = applyDuelReward(main, 250)
    expect(next.cookies).toBe(350)
    expect(next.cookiesBakedAllTime).toBe(750)
    expect(main.cookies).toBe(100)
  })

  it('ignores non-positive rewards', () => {
    const main = createInitialState()
    expect(applyDuelReward(main, 0)).toBe(main)
    expect(applyDuelReward(main, -5)).toBe(main)
  })

  it('gives winner both duel scores and loser nothing', () => {
    expect(computeSettleRewards(120, 40)).toEqual({
      winnerId: 'a',
      rewardA: 160,
      rewardB: 0,
    })
    expect(computeSettleRewards(10, 55)).toEqual({
      winnerId: 'b',
      rewardA: 0,
      rewardB: 65,
    })
  })

  it('on draw each keeps only their own duel score', () => {
    expect(computeSettleRewards(80, 80)).toEqual({
      winnerId: null,
      rewardA: 80,
      rewardB: 80,
    })
  })
})
