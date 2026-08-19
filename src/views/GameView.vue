<script setup lang="ts">
import BuildingRow from '@/components/BuildingRow.vue'
import ClickTarget from '@/components/ClickTarget.vue'
import CookieCounter from '@/components/CookieCounter.vue'
import GameLayout from '@/components/GameLayout.vue'
import NewsTicker from '@/components/NewsTicker.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import UpgradeShelf from '@/components/UpgradeShelf.vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
</script>

<template>
  <GameLayout>
    <template #bakery>
      <CookieCounter :cookies="game.formattedCookies" :cps="game.formattedCps" />
      <ClickTarget :gain="game.cookiesPerClick" @click="game.clickCookie" />
    </template>

    <template #center>
      <StatsPanel :baked="game.formattedBaked" :buildings-owned="game.buildingsOwned" />
      <NewsTicker />
    </template>

    <template #store>
      <UpgradeShelf :listings="game.upgradeListings" @buy="game.buyUpgrade" />
      <div class="store-list">
        <BuildingRow
          v-for="listing in game.storeListings"
          :key="listing.building.id"
          :name="listing.building.name"
          :owned="listing.owned"
          :price="listing.price"
          :affordable="listing.affordable"
          :locked="listing.locked"
          @buy="game.buyBuilding(listing.building.id)"
        />
      </div>
    </template>
  </GameLayout>
</template>

<style scoped>
.store-list {
  display: grid;
  gap: 0.55rem;
}
</style>
