import { describe, expect, it } from 'vitest'
import { normalizeDisplayName, validateDisplayName } from '@/multiplayer/profileName'
import { createMockBackend } from '@/multiplayer/mockBackend'

describe('display names', () => {
  it('normalizes and validates names', () => {
    expect(normalizeDisplayName('  Ana  Tol  ')).toBe('Ana Tol')
    expect(validateDisplayName('')).toBe('empty')
    expect(validateDisplayName('A')).toBe('short')
    expect(validateDisplayName('x'.repeat(21))).toBe('long')
    expect(validateDisplayName('Bad!')).toBe('invalid')
    expect(validateDisplayName('Zombie_42')).toBeNull()
  })

  it('updates mock profile and leaderboard name', async () => {
    localStorage.clear()
    const backend = createMockBackend()
    const profile = await backend.ensureAuth()
    const updated = await backend.updateDisplayName('Nightstalker')
    expect(updated.id).toBe(profile.id)
    expect(updated.displayName).toBe('Nightstalker')
    const board = await backend.getLeaderboard()
    expect(board.find((entry) => entry.id === profile.id)?.displayName).toBe('Nightstalker')
  })
})
