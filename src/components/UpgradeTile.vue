<script setup lang="ts">
import { computed } from 'vue'
import { formatCookies } from '@/game/format/numbers'

const props = defineProps<{
  name: string
  description: string
  price: number
  affordable: boolean
}>()

const emit = defineEmits<{
  buy: []
}>()

const initial = computed(() => props.name.charAt(0).toUpperCase() || '?')
const priceLabel = computed(() => formatCookies(props.price))
const tooltip = computed(() => `${props.name} — ${props.description}`)
</script>

<template>
  <button
    class="upgrade-tile"
    type="button"
    :disabled="!affordable"
    :title="tooltip"
    :aria-label="`${name}: ${description}. Cost ${priceLabel}`"
    @click="emit('buy')"
  >
    <span class="upgrade-tile__icon" aria-hidden="true">{{ initial }}</span>
    <span class="upgrade-tile__name">{{ name }}</span>
    <span class="upgrade-tile__price">{{ priceLabel }}</span>
  </button>
</template>

<style scoped>
.upgrade-tile {
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: center;
  justify-items: center;
  width: 72px;
  height: 72px;
  padding: 0.28rem 0.22rem;
  border: 1px solid #c9a15a;
  border-radius: 6px;
  background: linear-gradient(180deg, #7a4d28 0%, #4c2c14 100%);
  color: #f7e3c4;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255, 228, 180, 0.22),
    0 1px 0 rgba(0, 0, 0, 0.25);
}

.upgrade-tile:hover:not(:disabled) {
  background: linear-gradient(180deg, #8b5a30 0%, #5a3418 100%);
}

.upgrade-tile:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  filter: saturate(0.65);
}

.upgrade-tile__icon {
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1;
  color: #ffe7b3;
}

.upgrade-tile__name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.58rem;
  line-height: 1.15;
  text-align: center;
}

.upgrade-tile__price {
  font-size: 0.62rem;
  font-variant-numeric: tabular-nums;
  color: #ffe7b3;
}
</style>
