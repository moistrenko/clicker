<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCookies } from '@/game/format/numbers'
import { i18n, numberLocaleForApp, type AppLocale } from '@/i18n'

const props = withDefaults(
  defineProps<{
    name: string
    owned: number
    price: number
    affordable: boolean
    locked?: boolean
  }>(),
  { locked: false },
)

const emit = defineEmits<{
  buy: []
}>()

const { t } = useI18n()

const label = computed(() => (props.locked ? t('ui.locked') : props.name))
const priceLabel = computed(() => {
  if (props.locked) {
    return t('ui.locked')
  }
  const locale = numberLocaleForApp(i18n.global.locale.value as AppLocale)
  return formatCookies(props.price, { locale })
})
const disabled = computed(() => props.locked || !props.affordable)
const ownedLabel = computed(() =>
  props.locked ? t('ui.unknown') : t('ui.owned', { count: props.owned }),
)
</script>

<template>
  <button class="building-row" type="button" :disabled="disabled" @click="emit('buy')">
    <span class="building-row__name">{{ label }}</span>
    <span class="building-row__owned" :aria-label="ownedLabel">
      {{ locked ? '' : owned }}
    </span>
    <span class="building-row__price">{{ priceLabel }}</span>
  </button>
</template>

<style scoped>
.building-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid #5c3a1f;
  border-radius: 6px;
  background: linear-gradient(180deg, #6d4324 0%, #4a2b14 100%);
  color: #f4e1c1;
  text-align: left;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 220, 170, 0.18);
}

.building-row:hover:not(:disabled) {
  background: linear-gradient(180deg, #7b4d2b 0%, #553218 100%);
}

.building-row:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  filter: saturate(0.7);
}

.building-row__name {
  font-weight: 700;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.building-row__owned {
  min-width: 1.5rem;
  color: #d9b07a;
  font-variant-numeric: tabular-nums;
}

.building-row__price {
  font-variant-numeric: tabular-nums;
  color: #ffe7b3;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .building-row {
    gap: 0.5rem;
    padding: 0.65rem 0.75rem;
  }
}
</style>
