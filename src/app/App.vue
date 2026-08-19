<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageToggle from '@/components/LanguageToggle.vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { t, locale } = useI18n()

function syncDocumentTitle() {
  document.title = t('game.title')
}

watch(locale, syncDocumentTitle, { immediate: true })

onMounted(() => {
  game.start()
})

onUnmounted(() => {
  game.stop()
})
</script>

<template>
  <LanguageToggle />
  <RouterView />
</template>
