import { describe, expect, it } from 'vitest'
import { mapMatch, unwrapMatchRow } from '@/multiplayer/supabaseBackend'

describe('supabase match mapping', () => {
  it('treats null composite rows as no match', () => {
    expect(unwrapMatchRow(null)).toBeNull()
    expect(
      unwrapMatchRow({
        id: null,
        player_a: null,
        player_b: null,
        started_at: null,
        ends_at: null,
      }),
    ).toBeNull()
  })

  it('maps a valid row', () => {
    const match = mapMatch({
      id: 'm1',
      player_a: 'a',
      player_b: 'b',
      started_at: '2026-01-01T00:00:00.000Z',
      ends_at: '2026-01-01T00:05:00.000Z',
      score_a: 1,
      score_b: 2,
      status: 'active',
      winner_id: null,
      reward_a: 0,
      reward_b: 0,
    })
    expect(match.id).toBe('m1')
    expect(match.endsAt - match.startedAt).toBe(300_000)
  })
})
