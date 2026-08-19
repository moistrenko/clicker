import { describe, expect, it } from 'vitest'
import { formatCookies } from '@/game/format/numbers'

describe('number formatter', () => {
  it('groups integers below one million', () => {
    expect(formatCookies(1234)).toBe('1,234')
    expect(formatCookies(999_999)).toBe('999,999')
  })

  it('uses million form at 1,000,000', () => {
    expect(formatCookies(1_000_000)).toMatch(/million/)
    expect(formatCookies(1_000_000)).toBe('1 million')
    expect(formatCookies(1_235_000)).toBe('1.235 million')
  })

  it('uses billion form at 1e9', () => {
    expect(formatCookies(1e9)).toMatch(/billion/)
    expect(formatCookies(1e9)).toBe('1 billion')
  })
})
