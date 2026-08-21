import { describe, expect, it, beforeEach } from 'vitest'
import { gameAudio } from '@/audio/gameAudio'

describe('gameAudio', () => {
  beforeEach(() => {
    localStorage.clear()
    gameAudio.setMuted(false)
    gameAudio.setMusicMuted(false)
  })

  it('persists mute preferences', () => {
    gameAudio.setMuted(true)
    expect(gameAudio.muted).toBe(true)
    expect(JSON.parse(localStorage.getItem('clicker-audio') ?? '{}').muted).toBe(true)

    gameAudio.setMusicMuted(true)
    expect(gameAudio.musicMuted).toBe(true)
    expect(JSON.parse(localStorage.getItem('clicker-audio') ?? '{}').musicMuted).toBe(true)
  })

  it('play does not throw for all effect types', () => {
    expect(() => {
      gameAudio.play('click')
      gameAudio.play('buy')
      gameAudio.play('elite')
      gameAudio.play('unlock')
    }).not.toThrow()
  })
})
