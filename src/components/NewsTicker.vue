<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NEWS_TICKER } from '@/game/catalog/news'
import { clickTarget } from '@/theme/clickTarget'

const index = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const headline = computed(() => NEWS_TICKER[index.value] ?? NEWS_TICKER[0] ?? '')

onMounted(() => {
  timer = setInterval(() => {
    index.value = (index.value + 1) % NEWS_TICKER.length
  }, 7000)
})

onUnmounted(() => {
  if (timer !== undefined) {
    clearInterval(timer)
  }
})
</script>

<template>
  <section class="news" :aria-label="`${clickTarget.displayName} news`">
    <p class="news__kicker">News</p>
    <p class="news__headline">{{ headline }}</p>
  </section>
</template>

<style scoped>
.news {
  padding: 0.9rem 1rem;
  border-radius: 10px;
  background: #f7e7c8;
  border: 1px solid #e0c48a;
  min-height: 5.5rem;
}

.news__kicker {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8a5a28;
  margin-bottom: 0.35rem;
}

.news__headline {
  color: #4e3318;
  font-style: italic;
}
</style>
