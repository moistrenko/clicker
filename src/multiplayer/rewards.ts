import type { GameState } from '@/game/types'

/** Merge duel payout into the player's persistent main save. */
export function applyDuelReward(main: GameState, rewardKills: number): GameState {
  if (!(rewardKills > 0) || !Number.isFinite(rewardKills)) {
    return main
  }
  return {
    ...main,
    cookies: main.cookies + rewardKills,
    cookiesBakedAllTime: main.cookiesBakedAllTime + rewardKills,
  }
}
