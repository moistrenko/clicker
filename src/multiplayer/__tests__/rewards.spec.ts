import { describe, expect, it } from 'vitest'
import {
  DUEL_SPOILS_DRAW_SECONDS,
  DUEL_SPOILS_LOSS_SECONDS,
  DUEL_SPOILS_MULTIPLIER,
  DUEL_SPOILS_WIN_SECONDS,
} from '@/game/catalog/duelSpoils'
import { createInitialState, totalCps } from '@/game/engine'
import {
  applyDuelOutcome,
  applyDuelSpoilsBuff,
  duelSpoilsDurationSeconds,
  resolveDuelResultKind,
} from '@/multiplayer/rewards'
import { computeSettleRewards } from '@/multiplayer/types'

describe('duel rewards', () => {
  it('maps duel outcomes to buff durations', () => {
    expect(duelSpoilsDurationSeconds('win')).toBe(DUEL_SPOILS_WIN_SECONDS)
    expect(duelSpoilsDurationSeconds('loss')).toBe(DUEL_SPOILS_LOSS_SECONDS)
    expect(duelSpoilsDurationSeconds('draw')).toBe(DUEL_SPOILS_DRAW_SECONDS)
  })

  it('applies a passive-only duel spoils buff', () => {
    const main = {
      ...createInitialState(),
      buildings: { ...createInitialState().buildings, grandma: 1 },
      gameTime: 100,
    }
    const baseCps = totalCps(main)
    const next = applyDuelSpoilsBuff(main, 'win')
    const buff = next.activeBuffs.find((item) => item.type === 'duelSpoils')
    expect(buff?.multiplier).toBe(DUEL_SPOILS_MULTIPLIER)
    expect(buff?.expiresAt).toBe(100 + DUEL_SPOILS_WIN_SECONDS)
    expect(totalCps(next)).toBeCloseTo(baseCps * DUEL_SPOILS_MULTIPLIER)
  })

  it('replaces an existing duel spoils buff', () => {
    const withBuff = applyDuelSpoilsBuff(createInitialState(), 'loss')
    const next = applyDuelSpoilsBuff(withBuff, 'win')
    expect(next.activeBuffs.filter((item) => item.type === 'duelSpoils')).toHaveLength(1)
    expect(next.activeBuffs[0]?.expiresAt).toBe(DUEL_SPOILS_WIN_SECONDS)
  })

  it('records duel stats with spoils buff', () => {
    const main = createInitialState()
    const next = applyDuelOutcome(main, 'win')
    expect(next.duelWins).toBe(1)
    expect(next.duelLosses).toBe(0)
    expect(next.duelDraws).toBe(0)
    expect(next.activeBuffs.some((item) => item.type === 'duelSpoils')).toBe(true)
  })

  it('resolves result kind from settled match', () => {
    expect(resolveDuelResultKind({ winnerId: 'a' }, 'a')).toBe('win')
    expect(resolveDuelResultKind({ winnerId: 'a' }, 'b')).toBe('loss')
    expect(resolveDuelResultKind({ winnerId: null }, 'a')).toBe('draw')
  })

  it('still computes winner for server settle payloads', () => {
    expect(computeSettleRewards(120, 40)).toEqual({
      winnerId: 'a',
      rewardA: 160,
      rewardB: 0,
    })
    expect(computeSettleRewards(80, 80)).toEqual({
      winnerId: null,
      rewardA: 80,
      rewardB: 80,
    })
  })
})
