<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCookies } from '@/game/format/numbers'
import { i18n, numberLocaleForApp, type AppLocale } from '@/i18n'

const props = withDefaults(
  defineProps<{
    name: string
    description: string
    price: number
    affordable: boolean
    cpsGain?: number
    clickGain?: number
  }>(),
  { cpsGain: 0, clickGain: 0 },
)

const emit = defineEmits<{
  buy: []
}>()

const { t } = useI18n()

function formatRate(value: number): string {
  const locale = numberLocaleForApp(i18n.global.locale.value as AppLocale)
  return formatCookies(value, { locale })
}

const initial = computed(() => props.name.charAt(0).toUpperCase() || '?')
const priceLabel = computed(() => formatRate(props.price))

const effectLines = computed(() => {
  const lines: string[] = []
  if (props.cpsGain > 0) {
    lines.push(t('ui.cpsGain', { rate: formatRate(props.cpsGain) }))
  }
  if (props.clickGain > 0) {
    lines.push(t('ui.clickGain', { rate: formatRate(props.clickGain) }))
  }
  return lines
})

const ariaLabel = computed(() => {
  const effects = effectLines.value.length > 0 ? ` ${effectLines.value.join(', ')}.` : ''
  return `${props.name}: ${props.description}.${effects} ${t('ui.cost', { price: priceLabel.value })}`
})
</script>

<template>
  <button
    class="upgrade-tile"
    type="button"
    :disabled="!affordable"
    :aria-label="ariaLabel"
    @click="emit('buy')"
  >
    <span class="upgrade-tile__icon" aria-hidden="true">{{ initial }}</span>
    <span class="upgrade-tile__name">{{ name }}</span>
    <span class="upgrade-tile__price">{{ priceLabel }}</span>

    <span class="upgrade-tile__tooltip" role="tooltip">
      <strong class="upgrade-tile__tooltip-title">{{ name }}</strong>
      <span class="upgrade-tile__tooltip-desc">{{ description }}</span>
      <span class="upgrade-tile__tooltip-cost">{{ t('ui.cost', { price: priceLabel }) }}</span>
      <span v-if="effectLines.length > 0" class="upgrade-tile__tooltip-effects">
        <span class="upgrade-tile__tooltip-effects-label">{{ t('ui.upgradeEffect') }}</span>
        <span v-for="line in effectLines" :key="line">{{ line }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.upgrade-tile {
  position: relative;
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

.upgrade-tile:hover:not(:disabled),
.upgrade-tile:focus-visible:not(:disabled) {
  background: linear-gradient(180deg, #8b5a30 0%, #5a3418 100%);
  z-index: 5;
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

.upgrade-tile__tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.45rem);
  transform: translateX(-50%);
  display: none;
  width: max(180px, 100%);
  min-width: 180px;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(126, 207, 90, 0.35);
  background: rgba(18, 24, 16, 0.96);
  color: #e8f0e4;
  text-align: left;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.upgrade-tile:hover .upgrade-tile__tooltip,
.upgrade-tile:focus-visible .upgrade-tile__tooltip {
  display: grid;
  gap: 0.28rem;
}

.upgrade-tile__tooltip-title {
  font-size: 0.82rem;
  color: #9ecf7a;
}

.upgrade-tile__tooltip-desc {
  font-size: 0.72rem;
  line-height: 1.35;
  color: #c8d8c0;
}

.upgrade-tile__tooltip-cost {
  font-size: 0.72rem;
  color: #ffe7b3;
  font-variant-numeric: tabular-nums;
}

.upgrade-tile__tooltip-effects {
  display: grid;
  gap: 0.12rem;
  margin-top: 0.15rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(126, 207, 90, 0.2);
  font-size: 0.72rem;
  color: #b8f0a0;
}

.upgrade-tile__tooltip-effects-label {
  color: #8fa888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.62rem;
}

@media (max-width: 720px) {
  .upgrade-tile {
    width: 64px;
    height: 64px;
  }

  .upgrade-tile__tooltip {
    left: 0;
    right: auto;
    transform: none;
    min-width: 160px;
  }
}
</style>
