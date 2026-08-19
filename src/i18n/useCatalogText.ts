import { useI18n } from 'vue-i18n'
import { getBuilding } from '@/game/catalog/buildings'
import { getUpgrade } from '@/game/catalog/upgrades'
import { getAchievement } from '@/game/catalog/achievements'
import type { AchievementDef, BuildingId, UpgradeDef } from '@/game/types'

export function useCatalogText() {
  const { t, te, tm } = useI18n()

  function buildingName(id: BuildingId): string {
    const key = `buildings.${id}`
    return te(key) ? t(key) : getBuilding(id).name
  }

  function upgradeName(id: string): string {
    const key = `upgrades.${id}.name`
    return te(key) ? t(key) : (getUpgrade(id)?.name ?? id)
  }

  function upgradeDescription(upgrade: UpgradeDef): string {
    if (upgrade.alsoBoostClick) {
      return t('upgrades.cursorDescription', { kills: t('game.pluralName') })
    }
    return t('upgrades.buildingDescription', { building: buildingName(upgrade.buildingId) })
  }

  function achievementName(achievement: AchievementDef): string {
    const key = `achievements.${achievement.id}.name`
    return te(key) ? t(key) : achievement.name
  }

  function achievementDescription(achievement: AchievementDef): string {
    const key = `achievements.${achievement.id}.description`
    return te(key) ? t(key) : achievement.description
  }

  function newsHeadline(index: number): string {
    const headlines = tm('news') as string[]
    return Array.isArray(headlines) ? (headlines[index] ?? '') : ''
  }

  function buffName(type: string): string {
    const key = `buffs.${type}.name`
    return te(key) ? t(key) : type
  }

  function buffDescription(type: string, fallback: string): string {
    const key = `buffs.${type}.description`
    return te(key) ? t(key) : fallback
  }

  return {
    buildingName,
    upgradeName,
    upgradeDescription,
    achievementName,
    achievementDescription,
    newsHeadline,
    buffName,
    buffDescription,
  }
}
