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
    cpsEach?: number
    cpsTotal?: number
    buyCount?: number
  }>(),
  { locked: false, cpsEach: 0, cpsTotal: 0, buyCount: 1 },
)

const emit = defineEmits<{
  buy: []
}>()

const { t } = useI18n()

function formatRate(value: number): string {
  const locale = numberLocaleForApp(i18n.global.locale.value as AppLocale)
  return formatCookies(value, { locale })
}

const label = computed(() => (props.locked ? t('ui.locked') : props.name))
const priceLabel = computed(() => {
  if (props.locked) {
    return t('ui.locked')
  }
  return formatRate(props.price)
})
const disabled = computed(() => props.locked || !props.affordable)
const ownedLabel = computed(() =>
  props.locked ? t('ui.unknown') : t('ui.owned', { count: props.owned }),
)
const showBulk = computed(() => !props.locked && props.buyCount > 1)

const statsLine = computed(() => {
  if (props.locked) {
    return ''
  }
  const each = t('ui.cpsEach', { rate: formatRate(props.cpsEach) })
  if (props.owned <= 0) {
    return each
  }
  return `${each} · ${t('ui.cpsTotal', { rate: formatRate(props.cpsTotal) })}`
})
</script>

<template>
  <button
    class="building-row"
    type="button"
    data-testid="building-row"
    :disabled="disabled"
    @click="emit('buy')"
  >
    <span class="building-row__main">
      <span class="building-row__name">
        {{ label }}
        <span v-if="showBulk" class="building-row__bulk">{{ t('ui.buyBulk', { count: buyCount }) }}</span>
      </span>
      <span v-if="statsLine" class="building-row__stats">{{ statsLine }}</span>
    </span>
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

.building-row__main {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.building-row__name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.building-row__bulk {
  flex-shrink: 0;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background: rgba(126, 207, 90, 0.2);
  border: 1px solid rgba(126, 207, 90, 0.45);
  color: #b8f0a0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.building-row__stats {
  font-size: 0.72rem;
  line-height: 1.25;
  color: #c8b07a;
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

  .building-row__stats {
    white-space: normal;
  }
}
</style>
