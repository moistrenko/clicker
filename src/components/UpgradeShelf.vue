<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { UpgradeListing } from '@/game/types'
import UpgradeTile from '@/components/UpgradeTile.vue'

defineProps<{
  listings: UpgradeListing[]
  nameFor: (listing: UpgradeListing) => string
  descriptionFor: (listing: UpgradeListing) => string
}>()

const emit = defineEmits<{
  buy: [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <section v-if="listings.length > 0" class="upgrade-shelf" :aria-label="t('ui.upgrades')">
    <UpgradeTile
      v-for="listing in listings"
      :key="listing.upgrade.id"
      :name="nameFor(listing)"
      :description="descriptionFor(listing)"
      :price="listing.upgrade.cost"
      :affordable="listing.affordable"
      :cps-gain="listing.cpsGain"
      :click-gain="listing.clickGain"
      @buy="emit('buy', listing.upgrade.id)"
    />
  </section>
</template>

<style scoped>
.upgrade-shelf {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(247, 215, 161, 0.18);
}
</style>
