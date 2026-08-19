import { describe, expect, it } from 'vitest'
import { clickTarget } from '@/theme/clickTarget'

describe('clickTarget theme', () => {
  it('exports imageUrl and pluralName', () => {
    expect(clickTarget.imageUrl).toBeTruthy()
    expect(typeof clickTarget.imageUrl).toBe('string')
    expect(clickTarget.pluralName).toBe('kills')
    expect(clickTarget.displayName).toBe('Zombie')
    expect(clickTarget.gameTitle).toBe('Zombie Clicker')
  })
})
