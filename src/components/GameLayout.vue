<script setup lang="ts">
import { clickTarget } from '@/theme/clickTarget'
</script>

<template>
  <div class="game-layout">
    <section class="panel panel--bakery">
      <header class="bakery-title">
        <p class="eyebrow">Bakery</p>
        <h1>{{ clickTarget.displayName }} Clicker</h1>
      </header>
      <slot name="bakery" />
    </section>

    <section class="panel panel--center">
      <slot name="center" />
    </section>

    <aside class="panel panel--store">
      <h2>Store</h2>
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

.panel--bakery {
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 236, 190, 0.9), transparent 42%),
    linear-gradient(180deg, #f6dcb0 0%, #e8b56d 55%, #d49a4a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.panel--center {
  background: #f3e2c2;
  border-left: 1px solid #d8b57a;
  border-right: 1px solid #d8b57a;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel--store {
  background:
    repeating-linear-gradient(90deg, #3a2414 0 14px, #2b1a0e 14px 15px),
    linear-gradient(180deg, #4a2e18, #24140b);
  color: #f0d9b8;
  box-shadow: inset 8px 0 18px rgba(0, 0, 0, 0.25);
}

.panel--store h2 {
  margin-bottom: 0.9rem;
  font-size: 1.2rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f7d7a1;
}

.bakery-title {
  text-align: center;
}

.eyebrow {
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: #8a5520;
}

.bakery-title h1 {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: #5b2f0d;
}

@media (max-width: 900px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .panel--center {
    border-left: 0;
    border-right: 0;
    border-top: 1px solid #d8b57a;
    border-bottom: 1px solid #d8b57a;
  }
}
</style>
