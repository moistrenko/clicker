import { describe, expect, it } from 'vitest'
import { SAVE_VERSION } from '@/game/types'
import { parseSave } from '@/game/persist/storage'

describe('save persistence', () => {
  it('migrates a v1 save without upgrades to version 2', () => {
    const raw = JSON.stringify({
      version: 1,
      cookies: 50,
      cookiesBakedAllTime: 80,
      cookiesPerClick: 1,
      buildings: { cursor: 2, grandma: 1 },
    })
    const parsed = parseSave(raw)
    expect(parsed).not.toBeNull()
    expect(parsed?.version).toBe(SAVE_VERSION)
    expect(parsed?.version).toBe(2)
    expect(parsed?.upgrades).toEqual([])
    expect(parsed?.cookies).toBe(50)
    expect(parsed?.cookiesBakedAllTime).toBe(80)
    expect(parsed?.buildings.cursor).toBe(2)
    expect(parsed?.buildings.grandma).toBe(1)
    expect(parsed?.cookiesPerClick).toBe(1)
  })

  it('loads v2 upgrades and ignores unknown ids', () => {
    const raw = JSON.stringify({
      version: 2,
      cookies: 10,
      cookiesBakedAllTime: 200,
      buildings: { cursor: 1 },
      upgrades: ['cursor-1', 'not-real', 'cursor-1'],
    })
    const parsed = parseSave(raw)
    expect(parsed?.upgrades).toEqual(['cursor-1'])
    expect(parsed?.cookiesPerClick).toBe(2)
  })

  it('rejects unsupported save versions', () => {
    expect(parseSave(JSON.stringify({ version: 0, cookies: 1 }))).toBeNull()
    expect(parseSave(JSON.stringify({ version: 3, cookies: 1 }))).toBeNull()
  })
})
