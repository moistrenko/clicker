<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  rank: number
  multiplier: number
  projectedGain: number
  canAscend: boolean
}>()

const emit = defineEmits<{
  ascend: []
}>()

const { t } = useI18n()
const multiplierPercent = computed(() => Math.round((props.multiplier - 1) * 100))

function handleAscend() {
  if (!props.canAscend) {
    return
  }
  const confirmed = window.confirm(t('ui.ascendConfirm'))
  if (confirmed) {
    emit('ascend')
  }
}
</script>

<template>
  <section class="ascend" :aria-label="t('ui.ascend')">
    <h2>{{ t('ui.ascend') }}</h2>
    <p class="tagline">{{ t('ui.ascendTagline') }}</p>

    <dl>
      <div>
        <dt>{{ t('ui.survivorRank') }}</dt>
        <dd>{{ rank }}</dd>
      </div>
      <div>
        <dt>{{ t('ui.permanentBonus') }}</dt>
        <dd>{{ t('ui.permanentBonusValue', { percent: multiplierPercent }) }}</dd>
      </div>
      <div>
        <dt>{{ t('ui.nextAscend') }}</dt>
        <dd>
          +{{ projectedGain }}
          {{ projectedGain === 1 ? t('ui.rank') : t('ui.ranks') }}
        </dd>
      </div>
    </dl>

    <button type="button" class="ascend-btn" :disabled="!canAscend" @click="handleAscend">
      {{ t('ui.ascendButton') }}
    </button>
    <p v-if="!canAscend" class="hint">{{ t('ui.ascendHint') }}</p>
  </section>
</template>

<style scoped>
.ascend h2 {
  font-size: 1.05rem;
  margin-bottom: 0.35rem;
  color: #b8d4ae;
}

.tagline {
  margin-bottom: 0.85rem;
  font-size: 0.85rem;
  color: #8fa888;
  line-height: 1.35;
}

dl {
  display: grid;
  gap: 0.65rem;
  margin-bottom: 1rem;
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
  text-align: right;
}

.ascend-btn {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid #7ecf5a;
  border-radius: 8px;
  background: linear-gradient(180deg, #5a8f48 0%, #3f6835 100%);
  color: #f0f8ec;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.ascend-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ascend-btn:not(:disabled):hover {
  filter: brightness(1.08);
}

.hint {
  margin-top: 0.65rem;
  font-size: 0.78rem;
  color: #7a9472;
  line-height: 1.35;
}
</style>
