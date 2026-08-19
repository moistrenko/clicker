<script setup lang="ts">
import { clickTarget } from '@/theme/clickTarget'
</script>

<template>
  <div class="game-layout">
    <section class="panel panel--horde">
      <header class="horde-title">
        <p class="eyebrow">{{ clickTarget.zoneLabel }}</p>
        <h1>{{ clickTarget.gameTitle }}</h1>
      </header>
      <slot name="bakery" />
    </section>

    <section class="panel panel--center">
      <slot name="center" />
    </section>

    <aside class="panel panel--store">
      <h2>{{ clickTarget.storeLabel }}</h2>
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
  padding: 1.4rem 1.2rem 2rem;
}

.panel--horde {
  background:
    radial-gradient(circle at 50% 28%, rgba(126, 207, 90, 0.18), transparent 45%),
    linear-gradient(180deg, #4a5f48 0%, #354535 55%, #243024 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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
  font-size: 1.2rem;
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
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: #e8f0e4;
}

@media (max-width: 900px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .panel--center {
    border-left: 0;
    border-right: 0;
    border-top: 1px solid #4a5a46;
    border-bottom: 1px solid #4a5a46;
  }
}
</style>
