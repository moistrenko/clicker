export const DUEL_DURATION_SECONDS = 300
export const DUEL_SCORE_REPORT_INTERVAL_MS = 1500
export const BOT_USER_ID = 'bot-survivor'

export type DuelMatchStatus = 'active' | 'settled' | 'cancelled'

export interface DuelMatch {
  id: string
  playerA: string
  playerB: string
  startedAt: number
  endsAt: number
  scoreA: number
  scoreB: number
  status: DuelMatchStatus
  winnerId: string | null
  rewardA: number
  rewardB: number
}

export interface LeaderboardEntry {
  id: string
  displayName: string
  lifetimeKills: number
  duelWins: number
  duelLosses: number
}

export interface MultiplayerProfile {
  id: string
  displayName: string
}

export interface MultiplayerBackend {
  readonly kind: 'supabase' | 'mock'
  ensureAuth(): Promise<MultiplayerProfile>
  joinQueue(): Promise<DuelMatch | null>
  leaveQueue(): Promise<void>
  reportScore(matchId: string, kills: number): Promise<DuelMatch>
  settle(matchId: string): Promise<DuelMatch>
  getMatch(matchId: string): Promise<DuelMatch | null>
  subscribeMatch(matchId: string, onUpdate: (match: DuelMatch) => void): () => void
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>
  syncLifetimeKills(kills: number): Promise<void>
  updateDisplayName(displayName: string): Promise<MultiplayerProfile>
}

export function isPlayerA(match: DuelMatch, userId: string): boolean {
  return match.playerA === userId
}

export function ownScore(match: DuelMatch, userId: string): number {
  return isPlayerA(match, userId) ? match.scoreA : match.scoreB
}

export function opponentScore(match: DuelMatch, userId: string): number {
  return isPlayerA(match, userId) ? match.scoreB : match.scoreA
}

export function ownReward(match: DuelMatch, userId: string): number {
  return isPlayerA(match, userId) ? match.rewardA : match.rewardB
}

export function computeSettleRewards(scoreA: number, scoreB: number): {
  winnerId: 'a' | 'b' | null
  rewardA: number
  rewardB: number
} {
  if (scoreA > scoreB) {
    return { winnerId: 'a', rewardA: scoreA + scoreB, rewardB: 0 }
  }
  if (scoreB > scoreA) {
    return { winnerId: 'b', rewardA: 0, rewardB: scoreA + scoreB }
  }
  return { winnerId: null, rewardA: scoreA, rewardB: scoreB }
}
