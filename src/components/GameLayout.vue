<script setup lang="ts">
defineProps<{
  dueling?: boolean
}>()
</script>

<template>
  <div class="game-layout" :class="{ 'game-layout--duel': dueling }">
    <section class="panel panel--horde">
      <header class="horde-title">
        <p class="eyebrow">{{ $t('game.zoneLabel') }}</p>
        <h1>{{ $t('game.title') }}</h1>
      </header>
      <slot name="bakery" />
    </section>

    <section class="panel panel--center">
      <slot name="center" />
    </section>

    <aside class="panel panel--store">
      <h2>{{ $t('game.storeLabel') }}</h2>
      <slot name="store" />
    </aside>
  </div>
</template>

<style scoped>
.game-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(220px, 0.8fr) minmax(260px, 0.95fr);
  min-height: 100vh;
}

.panel {
  padding: clamp(0.85rem, 2.5vw, 1.4rem) clamp(0.75rem, 2vw, 1.2rem) clamp(1.25rem, 3vw, 2rem);
}

.panel--horde {
  background:
    radial-gradient(circle at 50% 28%, rgba(126, 207, 90, 0.18), transparent 45%),
    linear-gradient(180deg, #4a5f48 0%, #354535 55%, #243024 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.65rem, 2vw, 1rem);
  padding-top: clamp(2.5rem, 6vw, 3.25rem);
}

.panel--center {
  background: #2a3428;
  border-left: 1px solid #4a5a46;
  border-right: 1px solid #4a5a46;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel--store {
  background:
    repeating-linear-gradient(90deg, #1e241c 0 14px, #151a14 14px 15px),
    linear-gradient(180deg, #2a3228, #121812);
  color: #d8e8d0;
  box-shadow: inset 8px 0 18px rgba(0, 0, 0, 0.35);
}

.panel--store h2 {
  margin-bottom: 0.9rem;
  font-family: Rajdhani, 'Source Sans 3', sans-serif;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ecf7a;
}

.horde-title {
  text-align: center;
}

.eyebrow {
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: #9ecf7a;
}

.horde-title h1 {
  font-family: Rajdhani, 'Source Sans 3', sans-serif;
  font-weight: 700;
  letter-spacing: 0.04em;
  font-size: clamp(1.45rem, 4.5vw, 2.2rem);
  color: #e8f0e4;
}

.game-layout--duel .panel--horde {
  background:
    radial-gradient(circle at 50% 28%, rgba(198, 40, 40, 0.28), transparent 48%),
    linear-gradient(180deg, #5c2a32 0%, #3a1c22 55%, #1f1014 100%);
}

.game-layout--duel .panel--center {
  background: #2a181c;
  border-left-color: #6a3a42;
  border-right-color: #6a3a42;
}

.game-layout--duel .panel--store {
  background:
    repeating-linear-gradient(90deg, #241618 0 14px, #160e10 14px 15px),
    linear-gradient(180deg, #2c1a1e, #120a0c);
}

.game-layout--duel .panel--store h2 {
  color: #e07070;
}

.game-layout--duel .eyebrow {
  color: #d08080;
}

@media (max-width: 1100px) {
  .game-layout {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 0.95fr);
    grid-template-areas:
      'horde horde'
      'center store';
  }

  .panel--horde {
    grid-area: horde;
  }

  .panel--center {
    grid-area: center;
    border-left: 0;
    border-right: 1px solid #4a5a46;
  }

  .game-layout--duel .panel--center {
    border-right-color: #6a3a42;
  }

  .panel--store {
    grid-area: store;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  }
}

@media (max-width: 720px) {
  .game-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      'horde'
      'center'
      'store';
  }

  .panel--horde {
    min-height: auto;
    padding-top: clamp(2.75rem, 10vw, 3.5rem);
  }

  .panel--center {
    border-right: 0;
    border-top: 1px solid #4a5a46;
    border-bottom: 1px solid #4a5a46;
  }

  .game-layout--duel .panel--center {
    border-top-color: #6a3a42;
    border-bottom-color: #6a3a42;
  }

  .panel--store {
    box-shadow: none;
  }
}
</style>
