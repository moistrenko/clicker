import { rankFromKills } from '@/game/engine/prestige'
import { normalizeDisplayName, validateDisplayName } from '@/multiplayer/profileName'
import {
  BOT_USER_ID,
  DUEL_DURATION_SECONDS,
  computeSettleRewards,
  type DuelMatch,
  type LeaderboardEntry,
  type MultiplayerBackend,
  type MultiplayerProfile,
} from '@/multiplayer/types'

const PROFILE_KEY = 'clicker.mp.profile'
const LEADERBOARD_KEY = 'clicker.mp.leaderboard'

interface StoredProfile {
  id: string
  displayName: string
  lifetimeKills: number
  duelWins: number
  duelLosses: number
}

function now(): number {
  return Date.now()
}

function readProfile(): StoredProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) {
      return JSON.parse(raw) as StoredProfile
    }
  } catch {
    // ignore
  }
  const created: StoredProfile = {
    id: `local-${Math.random().toString(36).slice(2, 10)}`,
    displayName: `Survivor-${Math.floor(Math.random() * 900 + 100)}`,
    lifetimeKills: 0,
    duelWins: 0,
    duelLosses: 0,
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(created))
  return created
}

function writeProfile(profile: StoredProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

function readLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY)
    if (raw) {
      return JSON.parse(raw) as LeaderboardEntry[]
    }
  } catch {
    // ignore
  }
  return []
}

function writeLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 50)))
}

function upsertLeaderboard(entry: LeaderboardEntry) {
  const list = readLeaderboard().filter((item) => item.id !== entry.id)
  list.push(entry)
  list.sort(
    (a, b) =>
      rankFromKills(b.lifetimeKills) - rankFromKills(a.lifetimeKills) ||
      b.duelWins - a.duelWins ||
      b.lifetimeKills - a.lifetimeKills,
  )
  writeLeaderboard(list)
}

const matches = new Map<string, DuelMatch>()
const listeners = new Map<string, Set<(match: DuelMatch) => void>>()
const botIntervals = new Map<string, number>()

function publish(match: DuelMatch) {
  matches.set(match.id, match)
  const set = listeners.get(match.id)
  if (set) {
    for (const cb of set) {
      cb(match)
    }
  }
}

function settleMatch(match: DuelMatch): DuelMatch {
  if (match.status === 'settled') {
    return match
  }
  const botTimer = botIntervals.get(match.id)
  if (botTimer !== undefined) {
    window.clearInterval(botTimer)
    botIntervals.delete(match.id)
  }
  const { winnerId, rewardA, rewardB } = computeSettleRewards(match.scoreA, match.scoreB)
  const settled: DuelMatch = {
    ...match,
    status: 'settled',
    winnerId:
      winnerId === 'a' ? match.playerA : winnerId === 'b' ? match.playerB : null,
    rewardA,
    rewardB,
  }
  publish(settled)

  const profile = readProfile()
  if (settled.playerA === profile.id || settled.playerB === profile.id) {
    if (settled.winnerId === profile.id) {
      profile.duelWins += 1
    } else if (settled.winnerId) {
      profile.duelLosses += 1
    }
    writeProfile(profile)
    upsertLeaderboard({
      id: profile.id,
      displayName: profile.displayName,
      lifetimeKills: profile.lifetimeKills,
      duelWins: profile.duelWins,
      duelLosses: profile.duelLosses,
    })
  }
  return settled
}

function maybeSettle(match: DuelMatch): DuelMatch {
  if (match.status !== 'active') {
    return match
  }
  if (now() >= match.endsAt) {
    return settleMatch(match)
  }
  return match
}

function startBotAi(matchId: string) {
  const existing = botIntervals.get(matchId)
  if (existing !== undefined) {
    window.clearInterval(existing)
  }
  const timer = window.setInterval(() => {
    const current = matches.get(matchId)
    if (!current || current.status !== 'active') {
      window.clearInterval(timer)
      botIntervals.delete(matchId)
      return
    }
    if (current.playerB !== BOT_USER_ID) {
      return
    }
    const elapsed = (now() - current.startedAt) / 1000
    const botScore = Math.floor(elapsed * 3)
    publish(maybeSettle({ ...current, scoreB: Math.max(current.scoreB, botScore) }))
  }, 1000)
  botIntervals.set(matchId, timer)
}

export function createMockBackend(): MultiplayerBackend {
  return {
    kind: 'mock',

    async ensureAuth(): Promise<MultiplayerProfile> {
      const profile = readProfile()
      upsertLeaderboard({
        id: profile.id,
        displayName: profile.displayName,
        lifetimeKills: profile.lifetimeKills,
        duelWins: profile.duelWins,
        duelLosses: profile.duelLosses,
      })
      return { id: profile.id, displayName: profile.displayName }
    },

    async joinQueue() {
      const me = await this.ensureAuth()
      const active = [...matches.values()].find(
        (match) =>
          match.status === 'active' && (match.playerA === me.id || match.playerB === me.id),
      )
      if (active) {
        return maybeSettle({ ...active })
      }

      const startedAt = now()
      const match: DuelMatch = {
        id: `match-${Math.random().toString(36).slice(2, 10)}`,
        playerA: me.id,
        playerB: BOT_USER_ID,
        startedAt,
        endsAt: startedAt + DUEL_DURATION_SECONDS * 1000,
        scoreA: 0,
        scoreB: 0,
        status: 'active',
        winnerId: null,
        rewardA: 0,
        rewardB: 0,
      }
      publish(match)
      startBotAi(match.id)
      return match
    },

    async leaveQueue() {
      // no-op for instant bot matchmaking
    },

    async reportScore(matchId, kills) {
      const me = readProfile()
      let match = matches.get(matchId)
      if (!match) {
        throw new Error('match not found')
      }
      match = maybeSettle({ ...match })
      if (match.status !== 'active') {
        return match
      }
      const elapsed = Math.max(1, (now() - match.startedAt) / 1000)
      const capped = Math.min(Math.max(0, kills), elapsed * 1e12)
      const next = { ...match }
      if (me.id === next.playerA) {
        next.scoreA = Math.max(next.scoreA, capped)
      } else if (me.id === next.playerB) {
        next.scoreB = Math.max(next.scoreB, capped)
      }
      const published = maybeSettle(next)
      publish(published)
      return published
    },

    async settle(matchId) {
      const match = matches.get(matchId)
      if (!match) {
        throw new Error('match not found')
      }
      return settleMatch(match)
    },

    async getMatch(matchId) {
      const match = matches.get(matchId)
      return match ? maybeSettle({ ...match }) : null
    },

    async getActiveMatch() {
      const me = await this.ensureAuth()
      const active = [...matches.values()].find(
        (match) =>
          match.status === 'active' && (match.playerA === me.id || match.playerB === me.id),
      )
      return active ? maybeSettle({ ...active }) : null
    },

    subscribeMatch(matchId, onUpdate) {
      let set = listeners.get(matchId)
      if (!set) {
        set = new Set()
        listeners.set(matchId, set)
      }
      set.add(onUpdate)
      const existing = matches.get(matchId)
      if (existing) {
        onUpdate(maybeSettle({ ...existing }))
      }
      const timer = window.setInterval(() => {
        const match = matches.get(matchId)
        if (match) {
          onUpdate(maybeSettle({ ...match }))
        }
      }, 500)
      return () => {
        window.clearInterval(timer)
        set?.delete(onUpdate)
      }
    },

    async getLeaderboard(limit = 20) {
      const profile = readProfile()
      upsertLeaderboard({
        id: profile.id,
        displayName: profile.displayName,
        lifetimeKills: profile.lifetimeKills,
        duelWins: profile.duelWins,
        duelLosses: profile.duelLosses,
      })
      return readLeaderboard().slice(0, limit)
    },

    async syncLifetimeKills(kills: number) {
      const profile = readProfile()
      profile.lifetimeKills = Math.max(profile.lifetimeKills, Math.max(0, kills))
      writeProfile(profile)
      upsertLeaderboard({
        id: profile.id,
        displayName: profile.displayName,
        lifetimeKills: profile.lifetimeKills,
        duelWins: profile.duelWins,
        duelLosses: profile.duelLosses,
      })
    },

    async updateDisplayName(displayName: string) {
      const error = validateDisplayName(displayName)
      if (error) {
        throw new Error(error)
      }
      const name = normalizeDisplayName(displayName)
      const profile = readProfile()
      profile.displayName = name
      writeProfile(profile)
      upsertLeaderboard({
        id: profile.id,
        displayName: profile.displayName,
        lifetimeKills: profile.lifetimeKills,
        duelWins: profile.duelWins,
        duelLosses: profile.duelLosses,
      })
      return { id: profile.id, displayName: profile.displayName }
    },
  }
}
