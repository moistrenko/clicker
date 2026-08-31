<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ProfileModal from '@/components/ProfileModal.vue'
import TopChrome from '@/components/TopChrome.vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const { t, locale } = useI18n()
const profileOpen = ref(false)

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
  <TopChrome @open-profile="profileOpen = true" />
  <ProfileModal v-model:open="profileOpen" />
  <RouterView />
</template>
