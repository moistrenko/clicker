import { isSupabaseConfigured } from '@/multiplayer/config'
import { createMockBackend } from '@/multiplayer/mockBackend'
import { createSupabaseBackend } from '@/multiplayer/supabaseBackend'
import type { MultiplayerBackend } from '@/multiplayer/types'

let backend: MultiplayerBackend | null = null

export function getMultiplayerBackend(): MultiplayerBackend {
  if (!backend) {
    backend = isSupabaseConfigured() ? createSupabaseBackend() : createMockBackend()
  }
  return backend
}

/** Test helper to inject a backend. */
export function setMultiplayerBackendForTests(next: MultiplayerBackend | null) {
  backend = next
}

export {
  applyDuelReward,
} from '@/multiplayer/rewards'
export {
  BOT_USER_ID,
  DUEL_DURATION_SECONDS,
  DUEL_SCORE_REPORT_INTERVAL_MS,
  computeSettleRewards,
  opponentScore,
  ownReward,
  ownScore,
} from '@/multiplayer/types'
export type {
  DuelMatch,
  LeaderboardEntry,
  MultiplayerBackend,
  MultiplayerProfile,
} from '@/multiplayer/types'
export { isSupabaseConfigured } from '@/multiplayer/config'
