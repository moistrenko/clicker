<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCatalogText } from '@/i18n/useCatalogText'

const { t } = useI18n()
const { newsHeadline } = useCatalogText()

const index = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const headlines = computed(() => {
  const items: string[] = []
  for (let i = 0; i < 20; i += 1) {
    const line = newsHeadline(i)
    if (!line) {
      break
    }
    items.push(line)
  }
  return items
})

const headline = computed(() => headlines.value[index.value] ?? headlines.value[0] ?? '')

onMounted(() => {
  timer = setInterval(() => {
    if (headlines.value.length === 0) {
      return
    }
    index.value = (index.value + 1) % headlines.value.length
  }, 7000)
})

onUnmounted(() => {
  if (timer !== undefined) {
    clearInterval(timer)
  }
})
</script>

<template>
  <section class="news" :aria-label="t('game.newsAria', { name: t('game.displayName') })">
    <p class="news__kicker">{{ t('game.newsKicker') }}</p>
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
  line-height: 1.35;
}
</style>
