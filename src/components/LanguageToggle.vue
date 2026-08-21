<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import type { AppLocale } from '@/i18n'

const { t } = useI18n()
const localeStore = useLocaleStore()

const current = computed(() => localeStore.locale as AppLocale)

function pick(next: AppLocale) {
  localeStore.setLocale(next)
}
</script>

<template>
  <div class="language-toggle" role="group" :aria-label="t('ui.language')">
    <button
      type="button"
      class="language-toggle__btn"
      :class="{ 'language-toggle__btn--active': current === 'en' }"
      :aria-pressed="current === 'en'"
      @click="pick('en')"
    >
      EN
    </button>
    <button
      type="button"
      class="language-toggle__btn"
      :class="{ 'language-toggle__btn--active': current === 'ru' }"
      :aria-pressed="current === 'ru'"
      @click="pick('ru')"
    >
      RU
    </button>
  </div>
</template>

<style scoped>
.language-toggle {
  position: fixed;
  top: max(0.75rem, env(safe-area-inset-top, 0px));
  right: max(0.75rem, env(safe-area-inset-right, 0px));
  z-index: 120;
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.18rem;
  border-radius: 0.45rem;
  background: rgba(20, 26, 20, 0.9);
  border: 1px solid rgba(126, 207, 90, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(6px);
}

.language-toggle__btn {
  min-width: 2.35rem;
  padding: 0.35rem 0.55rem;
  border: 0;
  border-radius: 0.3rem;
  background: transparent;
  color: #b8d4ae;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
}

.language-toggle__btn--active {
  background: #456a3a;
  color: #f0f8ec;
}

.language-toggle__btn:not(.language-toggle__btn--active):hover {
  color: #e8f0e4;
}
</style>
