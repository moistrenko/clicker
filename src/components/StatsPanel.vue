<script setup lang="ts">
import { clickTarget } from '@/theme/clickTarget'

defineProps<{
  baked: string
  buildingsOwned: number
}>()
</script>

<template>
  <section class="stats" aria-label="Bakery stats">
    <h2>Stats</h2>
    <dl>
      <div>
        <dt>{{ clickTarget.pluralName }} baked</dt>
        <dd>{{ baked }}</dd>
      </div>
      <div>
        <dt>Buildings owned</dt>
        <dd>{{ buildingsOwned }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.stats h2 {
  font-size: 1.05rem;
  margin-bottom: 0.7rem;
  color: #6a3e16;
}

dl {
  display: grid;
  gap: 0.65rem;
}

dl div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0.7rem;
  background: rgba(255, 248, 230, 0.7);
  border-radius: 8px;
}

dt {
  color: #7a5330;
}

dd {
  font-weight: 700;
  color: #4a2a10;
  font-variant-numeric: tabular-nums;
}
</style>
