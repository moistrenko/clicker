import { describe, expect, it } from 'vitest'
import { clickTarget } from '@/theme/clickTarget'

describe('clickTarget theme', () => {
  it('exports imageUrl', () => {
    expect(clickTarget.imageUrl).toBeTruthy()
    expect(typeof clickTarget.imageUrl).toBe('string')
    expect(clickTarget.id).toBe('zombie')
  })
})
