import {
  DUEL_SPOILS_MULTIPLIER,
  duelSpoilsDurationSeconds,
  type DuelResultKind,
} from '@/game/catalog/duelSpoils'
import type { ActiveBuff, GameState } from '@/game/types'

export { duelSpoilsDurationSeconds, type DuelResultKind }

export function resolveDuelResultKind(
  settled: { winnerId: string | null },
  userId: string | undefined,
): DuelResultKind {
  if (!userId) {
    return 'loss'
  }
  if (!settled.winnerId) {
    return 'draw'
  }
  return settled.winnerId === userId ? 'win' : 'loss'
}

/** Apply or refresh the duel spoils passive-weapon buff on the main save. */
export function applyDuelSpoilsBuff(main: GameState, result: DuelResultKind): GameState {
  const durationSeconds = duelSpoilsDurationSeconds(result)
  if (!(durationSeconds > 0)) {
    return main
  }

  const gameTime = main.gameTime ?? 0
  const activeBuffs = (main.activeBuffs ?? []).filter((buff) => buff.type !== 'duelSpoils')
  const buff: ActiveBuff = {
    id: `duel-spoils-${gameTime}`,
    type: 'duelSpoils',
    multiplier: DUEL_SPOILS_MULTIPLIER,
    expiresAt: gameTime + durationSeconds,
  }

  return { ...main, activeBuffs: [...activeBuffs, buff] }
}

/** Apply duel spoils buff and record duel stats on the main save. */
export function applyDuelOutcome(main: GameState, result: DuelResultKind): GameState {
  const withBuff = applyDuelSpoilsBuff(main, result)
  return {
    ...withBuff,
    duelWins: (withBuff.duelWins ?? 0) + (result === 'win' ? 1 : 0),
    duelLosses: (withBuff.duelLosses ?? 0) + (result === 'loss' ? 1 : 0),
    duelDraws: (withBuff.duelDraws ?? 0) + (result === 'draw' ? 1 : 0),
  }
}
