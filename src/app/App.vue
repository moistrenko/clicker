<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useGameStore } from '@/stores/game'

const game = useGameStore()

onMounted(() => {
  game.start()
})

onUnmounted(() => {
  game.stop()
})
</script>

<template>
  <RouterView />
</template>
