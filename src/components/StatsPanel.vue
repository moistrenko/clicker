<script setup lang="ts">
import { clickTarget } from '@/theme/clickTarget'

defineProps<{
  baked: string
  buildingsOwned: number
}>()
</script>

<template>
  <section class="stats" aria-label="Survival stats">
    <h2>Stats</h2>
    <dl>
      <div>
        <dt>{{ clickTarget.totalStatLabel }}</dt>
        <dd>{{ baked }}</dd>
      </div>
      <div>
        <dt>{{ clickTarget.weaponsStatLabel }}</dt>
        <dd>{{ buildingsOwned }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.stats h2 {
  font-size: 1.05rem;
  margin-bottom: 0.7rem;
  color: #b8d4ae;
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
  background: rgba(42, 52, 40, 0.85);
  border-radius: 8px;
}

dt {
  color: #9ecf7a;
}

dd {
  font-weight: 700;
  color: #e8f0e4;
  font-variant-numeric: tabular-nums;
}
</style>
