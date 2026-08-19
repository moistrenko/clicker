<script setup lang="ts">
import type { UpgradeListing } from '@/game/types'
import UpgradeTile from '@/components/UpgradeTile.vue'

defineProps<{
  listings: UpgradeListing[]
}>()

const emit = defineEmits<{
  buy: [id: string]
}>()
</script>

<template>
  <section v-if="listings.length > 0" class="upgrade-shelf" aria-label="Upgrades">
    <UpgradeTile
      v-for="listing in listings"
      :key="listing.upgrade.id"
      :name="listing.upgrade.name"
      :description="listing.upgrade.description"
      :price="listing.upgrade.cost"
      :affordable="listing.affordable"
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
