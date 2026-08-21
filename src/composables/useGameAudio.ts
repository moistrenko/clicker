import { computed, ref } from 'vue'
import { gameAudio } from '@/audio/gameAudio'

const muted = ref(gameAudio.muted)
const musicMuted = ref(gameAudio.musicMuted)

export function useGameAudio() {
  function unlock() {
    gameAudio.unlock()
  }

  function playClick() {
    gameAudio.unlock()
    gameAudio.play('click')
  }

  function playBuy() {
    gameAudio.unlock()
    gameAudio.play('buy')
  }

  function playElite() {
    gameAudio.unlock()
    gameAudio.play('elite')
  }

  function playUnlock() {
    gameAudio.unlock()
    gameAudio.play('unlock')
  }

  function setMuted(next: boolean) {
    gameAudio.setMuted(next)
    muted.value = next
  }

  function setMusicMuted(next: boolean) {
    gameAudio.setMusicMuted(next)
    musicMuted.value = next
  }

  function toggleMuted() {
    setMuted(!muted.value)
  }

  function toggleMusicMuted() {
    setMusicMuted(!musicMuted.value)
  }

  return {
    muted: computed(() => muted.value),
    musicMuted: computed(() => musicMuted.value),
    unlock,
    playClick,
    playBuy,
    playElite,
    playUnlock,
    setMuted,
    setMusicMuted,
    toggleMuted,
    toggleMusicMuted,
  }
}
