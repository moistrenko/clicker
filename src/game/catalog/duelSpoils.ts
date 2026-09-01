export const DUEL_SPOILS_MULTIPLIER = 3
export const DUEL_SPOILS_WIN_SECONDS = 5 * 60
export const DUEL_SPOILS_LOSS_SECONDS = 60
export const DUEL_SPOILS_DRAW_SECONDS = 2 * 60

export type DuelResultKind = 'win' | 'loss' | 'draw'

export function duelSpoilsDurationSeconds(result: DuelResultKind): number {
  switch (result) {
    case 'win':
      return DUEL_SPOILS_WIN_SECONDS
    case 'loss':
      return DUEL_SPOILS_LOSS_SECONDS
    case 'draw':
      return DUEL_SPOILS_DRAW_SECONDS
  }
}
