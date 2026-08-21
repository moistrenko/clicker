export type SoundEffect = 'click' | 'buy' | 'elite' | 'unlock'

const STORAGE_KEY = 'clicker-audio'

interface AudioPrefs {
  muted: boolean
  musicMuted: boolean
}

function readPrefs(): AudioPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { muted: false, musicMuted: false }
    }
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>
    return {
      muted: Boolean(parsed.muted),
      musicMuted: Boolean(parsed.musicMuted),
    }
  } catch {
    return { muted: false, musicMuted: false }
  }
}

function writePrefs(prefs: AudioPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

class GameAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private musicGain: GainNode | null = null
  private musicOscillators: OscillatorNode[] = []
  private musicStarted = false
  private prefs = readPrefs()

  get muted() {
    return this.prefs.muted
  }

  get musicMuted() {
    return this.prefs.musicMuted
  }

  private ensureContext() {
    if (typeof window === 'undefined') {
      return null
    }
    if (!this.context) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (typeof Ctx !== 'function') {
        return null
      }
      try {
        this.context = new Ctx()
      } catch {
        return null
      }
      this.master = this.context.createGain()
      this.master.gain.value = this.prefs.muted ? 0 : 0.35
      this.master.connect(this.context.destination)

      this.musicGain = this.context.createGain()
      this.musicGain.gain.value = this.prefs.musicMuted || this.prefs.muted ? 0 : 0.045
      this.musicGain.connect(this.master)
    }
    if (this.context.state === 'suspended') {
      void this.context.resume()
    }
    return this.context
  }

  unlock() {
    this.ensureContext()
    this.startMusic()
  }

  setMuted(muted: boolean) {
    this.prefs.muted = muted
    writePrefs(this.prefs)
    const ctx = this.ensureContext()
    if (ctx && this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.35, ctx.currentTime, 0.02)
    }
    this.applyMusicGain()
  }

  setMusicMuted(musicMuted: boolean) {
    this.prefs.musicMuted = musicMuted
    writePrefs(this.prefs)
    this.applyMusicGain()
    if (!musicMuted) {
      this.startMusic()
    }
  }

  private applyMusicGain() {
    const ctx = this.ensureContext()
    if (!ctx || !this.musicGain) {
      return
    }
    const value = this.prefs.muted || this.prefs.musicMuted ? 0 : 0.045
    this.musicGain.gain.setTargetAtTime(value, ctx.currentTime, 0.05)
  }

  private startMusic() {
    const ctx = this.ensureContext()
    if (!ctx || !this.musicGain || this.musicStarted) {
      return
    }
    this.musicStarted = true

    const drones = [55, 82.5, 110]
    for (const freq of drones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0.22
      osc.connect(gain)
      gain.connect(this.musicGain)
      osc.start()
      this.musicOscillators.push(osc)
    }
  }

  play(effect: SoundEffect) {
    const ctx = this.ensureContext()
    if (!ctx || !this.master || this.prefs.muted) {
      return
    }

    const now = ctx.currentTime
    if (effect === 'click') {
      this.beep(ctx, now, 420, 0.05, 0.12, 'square')
      this.beep(ctx, now + 0.02, 180, 0.06, 0.08, 'triangle')
      return
    }
    if (effect === 'buy') {
      this.beep(ctx, now, 320, 0.05, 0.1, 'triangle')
      this.beep(ctx, now + 0.05, 480, 0.07, 0.1, 'sine')
      return
    }
    if (effect === 'elite') {
      this.beep(ctx, now, 520, 0.08, 0.14, 'sawtooth')
      this.beep(ctx, now + 0.07, 760, 0.1, 0.12, 'triangle')
      this.beep(ctx, now + 0.14, 980, 0.12, 0.1, 'sine')
      return
    }
    this.beep(ctx, now, 660, 0.08, 0.12, 'sine')
    this.beep(ctx, now + 0.08, 880, 0.1, 0.1, 'triangle')
  }

  private beep(
    ctx: AudioContext,
    start: number,
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType,
  ) {
    if (!this.master) {
      return
    }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(start)
    osc.stop(start + duration + 0.02)
  }
}

export const gameAudio = new GameAudio()
