<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AscendPanel from '@/components/AscendPanel.vue'
import AchievementToast from '@/components/AchievementToast.vue'
import AchievementsPanel from '@/components/AchievementsPanel.vue'
import BuffBar from '@/components/BuffBar.vue'
import BuildingRow from '@/components/BuildingRow.vue'
import ClickTarget from '@/components/ClickTarget.vue'
import CookieCounter from '@/components/CookieCounter.vue'
import GameLayout from '@/components/GameLayout.vue'
import GoldenCookie from '@/components/GoldenCookie.vue'
import NewsTicker from '@/components/NewsTicker.vue'
import OfflineBanner from '@/components/OfflineBanner.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import UpgradeShelf from '@/components/UpgradeShelf.vue'
import { useCatalogText } from '@/i18n/useCatalogText'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { t } = useI18n()
const { buildingName, upgradeName, upgradeDescription } = useCatalogText()
const settingsPanel = ref<InstanceType<typeof SettingsPanel> | null>(null)

function handleImportSave(raw: string) {
  const ok = game.importSave(raw)
  if (!ok) {
    settingsPanel.value?.setImportError(t('errors.importFailed'))
  }
}
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
      <AscendPanel
        :rank="game.prestigeLevel"
        :multiplier="game.prestigeBonus"
        :projected-gain="game.ascendGain"
        :can-ascend="game.canAscendNow"
        @ascend="game.ascend"
      />
      <AchievementsPanel :listings="game.achievementList" />
      <NewsTicker />
      <SettingsPanel
        ref="settingsPanel"
        @export-save="game.exportSaveToClipboard"
        @import-save="handleImportSave"
        @wipe-save="game.wipeSave"
      />
    </template>

    <template #store>
      <UpgradeShelf
        :listings="game.upgradeListings"
        :name-for="(listing) => upgradeName(listing.upgrade.id)"
        :description-for="(listing) => upgradeDescription(listing.upgrade)"
        @buy="game.buyUpgrade"
      />
      <div class="store-list">
        <BuildingRow
          v-for="listing in game.storeListings"
          :key="listing.building.id"
          :name="buildingName(listing.building.id)"
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
  <OfflineBanner :kills="game.offlineKills" @dismissed="game.clearOfflineBanner" />
</template>

<style scoped>
.bakery-stage {
  position: relative;
  width: min(88vw, 340px);
  margin: 0 auto;
}

.store-list {
  display: grid;
  gap: 0.55rem;
}

@media (max-width: 720px) {
  .bakery-stage {
    width: min(92vw, 360px);
  }
}
</style>
