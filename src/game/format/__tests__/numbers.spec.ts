import { describe, expect, it } from 'vitest'
import { formatCookies, formatCookiesParts } from '@/game/format/numbers'

describe('number formatter', () => {
  it('groups integers below one million', () => {
    expect(formatCookies(1234)).toBe('1,234')
    expect(formatCookies(999_999)).toBe('999,999')
  })

  it('keeps a sensible decimal for non-integers below one million', () => {
    expect(formatCookies(0.1)).toBe('0.1')
    expect(formatCookies(1.1)).toBe('1.1')
    expect(formatCookies(0.8)).toBe('0.8')
    expect(formatCookies(1234.5)).toBe('1,234.5')
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

  it('exposes coefficient and scale separately for stable UI layout', () => {
    expect(formatCookiesParts(999_999)).toEqual({ coefficient: '999,999', scale: null })
    expect(formatCookiesParts(1_235_000)).toEqual({ coefficient: '1.235', scale: 'million' })
    expect(formatCookiesParts(1e9)).toEqual({ coefficient: '1', scale: 'billion' })
  })
})
