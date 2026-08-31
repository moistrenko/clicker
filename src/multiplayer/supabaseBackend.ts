import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from '@/multiplayer/config'
import type {
  DuelMatch,
  LeaderboardEntry,
  MultiplayerBackend,
  MultiplayerProfile,
} from '@/multiplayer/types'

interface DbMatch {
  id: string
  player_a: string
  player_b: string
  started_at: string
  ends_at: string
  score_a: number
  score_b: number
  status: 'active' | 'settled' | 'cancelled'
  winner_id: string | null
  reward_a: number
  reward_b: number
}

/** PostgREST often returns a null composite as `{ id: null, ... }` instead of JSON null. */
export function unwrapMatchRow(data: unknown): DbMatch | null {
  if (data == null) {
    return null
  }
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null
  if (!row || typeof row !== 'object') {
    return null
  }
  if (!row.id || !row.player_a || !row.player_b || !row.ends_at || !row.started_at) {
    return null
  }
  return row as unknown as DbMatch
}

export function mapMatch(row: DbMatch): DuelMatch {
  const startedAt = Date.parse(String(row.started_at))
  const endsAt = Date.parse(String(row.ends_at))
  if (!Number.isFinite(startedAt) || !Number.isFinite(endsAt)) {
    throw new Error('Invalid match timestamps from Supabase')
  }
  return {
    id: String(row.id),
    playerA: String(row.player_a),
    playerB: String(row.player_b),
    startedAt,
    endsAt,
    scoreA: Number(row.score_a) || 0,
    scoreB: Number(row.score_b) || 0,
    status: row.status,
    winnerId: row.winner_id ? String(row.winner_id) : null,
    rewardA: Number(row.reward_a) || 0,
    rewardB: Number(row.reward_b) || 0,
  }
}

export function createSupabaseBackend(): MultiplayerBackend {
  const { url, anonKey } = getSupabaseEnv()
  const client: SupabaseClient = createClient(url, anonKey)
  let profile: MultiplayerProfile | null = null

  return {
    kind: 'supabase',

    async ensureAuth() {
      if (profile) {
        return profile
      }
      const existing = await client.auth.getSession()
      if (!existing.data.session) {
        const { error } = await client.auth.signInAnonymously()
        if (error) {
          throw error
        }
      }
      const user = (await client.auth.getUser()).data.user
      if (!user) {
        throw new Error('Supabase auth failed')
      }
      const { data, error } = await client.rpc('ensure_profile')
      if (error) {
        throw error
      }
      const row = (Array.isArray(data) ? data[0] : data) as {
        id: string
        display_name: string
      } | null
      if (!row?.id) {
        profile = { id: user.id, displayName: 'Survivor' }
      } else {
        profile = { id: row.id, displayName: row.display_name || 'Survivor' }
      }
      return profile
    },

    async joinQueue() {
      await this.ensureAuth()
      const { data, error } = await client.rpc('join_duel_queue')
      if (error) {
        throw error
      }
      const row = unwrapMatchRow(data)
      if (!row) {
        return null
      }
      return mapMatch(row)
    },

    async leaveQueue() {
      await client.rpc('leave_duel_queue')
    },

    async reportScore(matchId, kills) {
      const { data, error } = await client.rpc('report_duel_score', {
        p_match_id: matchId,
        p_kills: kills,
      })
      if (error) {
        throw error
      }
      const row = unwrapMatchRow(data)
      if (!row) {
        throw new Error('Invalid score response')
      }
      return mapMatch(row)
    },

    async settle(matchId) {
      const { data, error } = await client.rpc('settle_duel', { p_match_id: matchId })
      if (error) {
        throw error
      }
      const row = unwrapMatchRow(data)
      if (!row) {
        throw new Error('Invalid settle response')
      }
      return mapMatch(row)
    },

    async getMatch(matchId) {
      const { data, error } = await client
        .from('duel_matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle()
      if (error) {
        throw error
      }
      const row = unwrapMatchRow(data)
      return row ? mapMatch(row) : null
    },

    subscribeMatch(matchId, onUpdate) {
      const channel: RealtimeChannel = client
        .channel(`duel:${matchId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'duel_matches',
            filter: `id=eq.${matchId}`,
          },
          (payload) => {
            const row = unwrapMatchRow(payload.new)
            if (row) {
              onUpdate(mapMatch(row))
            }
          },
        )
        .subscribe()

      const poll = window.setInterval(() => {
        void this.getMatch(matchId).then((match) => {
          if (match) {
            onUpdate(match)
          }
        })
      }, 2000)

      return () => {
        window.clearInterval(poll)
        void client.removeChannel(channel)
      }
    },

    async getLeaderboard(limit = 20) {
      const { data, error } = await client.rpc('get_leaderboard', { p_limit: limit })
      if (error) {
        throw error
      }
      return ((data as Array<{
        id: string
        display_name: string
        lifetime_kills: number
        duel_wins: number
        duel_losses: number
      }>) ?? []).map((row) => ({
        id: row.id,
        displayName: row.display_name,
        lifetimeKills: Number(row.lifetime_kills) || 0,
        duelWins: row.duel_wins ?? 0,
        duelLosses: row.duel_losses ?? 0,
      }))
    },

    async syncLifetimeKills(kills: number) {
      await this.ensureAuth()
      const { error } = await client.rpc('sync_lifetime_kills', { p_kills: kills })
      if (error) {
        throw error
      }
    },
  }
}
