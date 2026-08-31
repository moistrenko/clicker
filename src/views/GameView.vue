<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AscendPanel from '@/components/AscendPanel.vue'
import AchievementToast from '@/components/AchievementToast.vue'
import AchievementsPanel from '@/components/AchievementsPanel.vue'
import BuffBar from '@/components/BuffBar.vue'
import BuildingRow from '@/components/BuildingRow.vue'
import ClickTarget from '@/components/ClickTarget.vue'
import CookieCounter from '@/components/CookieCounter.vue'
import DuelPanel from '@/components/DuelPanel.vue'
import EventBanner from '@/components/EventBanner.vue'
import GameLayout from '@/components/GameLayout.vue'
import GoldenCookie from '@/components/GoldenCookie.vue'
import LeaderboardPanel from '@/components/LeaderboardPanel.vue'
import NewsTicker from '@/components/NewsTicker.vue'
import OfflineBanner from '@/components/OfflineBanner.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import UpgradeShelf from '@/components/UpgradeShelf.vue'
import { useBuyBulk } from '@/composables/useBuyBulk'
import { useGameAudio } from '@/composables/useGameAudio'
import { bulkBuildingPrice, maxAffordableBuildingCount } from '@/game/engine'
import { useCatalogText } from '@/i18n/useCatalogText'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { t } = useI18n()
const { buildingName, upgradeName, upgradeDescription } = useCatalogText()
const { bulk } = useBuyBulk()
const {
  muted,
  musicMuted,
  playClick,
  playBuy,
  playElite,
  toggleMuted,
  toggleMusicMuted,
} = useGameAudio()
const settingsPanel = ref<InstanceType<typeof SettingsPanel> | null>(null)

const storeRows = computed(() =>
  game.storeListings.map((listing) => {
    if (listing.locked || bulk.value === 1) {
      return {
        ...listing,
        buyCount: 1,
        displayPrice: listing.price,
        canAffordBulk: listing.affordable,
        isMaxBulk: false,
      }
    }

    const buyCount =
      bulk.value === 'max'
        ? maxAffordableBuildingCount(listing.building.baseCost, listing.owned, game.cookies)
        : bulk.value
    const displayPrice = bulkBuildingPrice(listing.building.baseCost, listing.owned, buyCount)

    return {
      ...listing,
      buyCount,
      displayPrice,
      canAffordBulk: buyCount > 0 && game.cookies >= displayPrice,
      isMaxBulk: bulk.value === 'max',
    }
  }),
)

function handleImportSave(raw: string) {
  const ok = game.importSave(raw)
  if (!ok) {
    settingsPanel.value?.setImportError(t('errors.importFailed'))
  }
}

function handleClick() {
  playClick()
  game.clickCookie()
}

function handleElite() {
  playElite()
  game.collectGoldenCookie()
}

function handleBuyBuilding(id: Parameters<typeof game.buyBuilding>[0], count: number) {
  if (game.buyBuilding(id, count)) {
    playBuy()
  }
}

function handleBuyUpgrade(id: string) {
  if (game.buyUpgrade(id)) {
    playBuy()
  }
}
</script>

<template>
  <GameLayout>
    <template #bakery>
      <div class="bakery-stage">
        <CookieCounter
          :coefficient="game.cookiesDisplay.coefficient"
          :scale="game.cookiesDisplay.scale"
          :cps="game.formattedCps"
        />
        <ClickTarget :gain="game.cookiesPerClick" @click="handleClick" />
        <GoldenCookie
          v-if="game.goldenCookie"
          :x="game.goldenCookie.x"
          :y="game.goldenCookie.y"
          @click="handleElite"
        />
      </div>
      <BuffBar :buffs="game.activeBuffs" />
      <EventBanner :events="game.activeEvents" />
    </template>

    <template #center>
      <p v-if="game.duelMode" class="duel-banner">{{ t('multiplayer.duelTitle') }}</p>
      <StatsPanel :baked="game.formattedBaked" :buildings-owned="game.buildingsOwned" />
      <DuelPanel />
      <LeaderboardPanel />
      <AscendPanel
        v-if="!game.duelMode"
        :rank="game.prestigeLevel"
        :multiplier="game.prestigeBonus"
        :projected-gain="game.ascendGain"
        :can-ascend="game.canAscendNow"
        @ascend="game.ascend"
      />
      <AchievementsPanel v-if="!game.duelMode" :listings="game.achievementList" />
      <NewsTicker v-if="!game.duelMode" />
      <SettingsPanel
        v-if="!game.duelMode"
        ref="settingsPanel"
        :muted="muted"
        :music-muted="musicMuted"
        @export-save="game.exportSaveToClipboard"
        @import-save="handleImportSave"
        @wipe-save="game.wipeSave"
        @toggle-muted="toggleMuted"
        @toggle-music-muted="toggleMusicMuted"
      />
    </template>

    <template #store>
      <p class="buy-bulk-hint">{{ t('ui.buyBulkHint') }}</p>
      <UpgradeShelf
        :listings="game.upgradeListings"
        :name-for="(listing) => upgradeName(listing.upgrade.id)"
        :description-for="(listing) => upgradeDescription(listing.upgrade)"
        @buy="handleBuyUpgrade"
      />
      <div class="store-list">
        <BuildingRow
          v-for="listing in storeRows"
          :key="listing.building.id"
          :name="buildingName(listing.building.id)"
          :owned="listing.owned"
          :price="listing.displayPrice"
          :affordable="listing.canAffordBulk"
          :locked="listing.locked"
          :cps-each="listing.cpsEach"
          :cps-total="listing.cpsTotal"
          :buy-count="listing.buyCount"
          :is-max-bulk="listing.isMaxBulk"
          @buy="handleBuyBuilding(listing.building.id, listing.buyCount)"
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

.duel-banner {
  margin: 0 0 0.35rem;
  font-family: Rajdhani, 'Source Sans 3', sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffe7b3;
  font-size: 0.95rem;
}

.buy-bulk-hint {
  margin: -0.35rem 0 0.75rem;
  font-size: 0.72rem;
  line-height: 1.35;
  color: #8fa888;
  opacity: 0.92;
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
