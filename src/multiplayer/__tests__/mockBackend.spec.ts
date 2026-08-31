import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockBackend } from '@/multiplayer/mockBackend'
import { setMultiplayerBackendForTests } from '@/multiplayer'
import { BOT_USER_ID } from '@/multiplayer/types'

describe('mock multiplayer backend', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    setMultiplayerBackendForTests(null)
    vi.useRealTimers()
  })

  it('creates a bot match and settles rewards', async () => {
    const backend = createMockBackend()
    setMultiplayerBackendForTests(backend)
    const profile = await backend.ensureAuth()

    const match = await backend.joinQueue()
    expect(match).not.toBeNull()
    if (!match) {
      return
    }
    expect(match.playerA).toBe(profile.id)
    expect(match.playerB).toBe(BOT_USER_ID)
    expect(match.status).toBe('active')

    await backend.reportScore(match.id, 100)
    const settled = await backend.settle(match.id)
    expect(settled.status).toBe('settled')
    expect(settled.rewardA).toBe(settled.scoreA + settled.scoreB)
    expect(settled.winnerId).toBe(profile.id)

    const board = await backend.getLeaderboard()
    expect(board.some((entry) => entry.id === profile.id)).toBe(true)
  })
})
