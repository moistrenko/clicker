<script setup lang="ts">
import AchievementToast from '@/components/AchievementToast.vue'
import AchievementsPanel from '@/components/AchievementsPanel.vue'
import BuffBar from '@/components/BuffBar.vue'
import BuildingRow from '@/components/BuildingRow.vue'
import ClickTarget from '@/components/ClickTarget.vue'
import CookieCounter from '@/components/CookieCounter.vue'
import GameLayout from '@/components/GameLayout.vue'
import GoldenCookie from '@/components/GoldenCookie.vue'
import NewsTicker from '@/components/NewsTicker.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import UpgradeShelf from '@/components/UpgradeShelf.vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
</script>

<template>
  <GameLayout>
    <template #bakery>
      <div class="bakery-stage">
        <CookieCounter :cookies="game.formattedCookies" :cps="game.formattedCps" />
        <ClickTarget :gain="game.cookiesPerClick" @click="game.clickCookie" />
        <GoldenCookie
          v-if="game.goldenCookie"
          :x="game.goldenCookie.x"
          :y="game.goldenCookie.y"
          @click="game.collectGoldenCookie"
        />
      </div>
      <BuffBar :buffs="game.activeBuffs" />
    </template>

    <template #center>
      <StatsPanel :baked="game.formattedBaked" :buildings-owned="game.buildingsOwned" />
      <AchievementsPanel :listings="game.achievementList" />
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

  <AchievementToast :achievement="game.recentAchievement" @dismissed="game.clearRecentAchievement" />
</template>

<style scoped>
.bakery-stage {
  position: relative;
  width: min(78vw, 340px);
  margin: 0 auto;
}

.store-list {
  display: grid;
  gap: 0.55rem;
}
</style>
