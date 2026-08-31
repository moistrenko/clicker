<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import type { AppLocale } from '@/i18n'

const emit = defineEmits<{
  openProfile: []
}>()

const { t } = useI18n()
const localeStore = useLocaleStore()

const current = computed(() => localeStore.locale as AppLocale)

function pick(next: AppLocale) {
  localeStore.setLocale(next)
}
</script>

<template>
  <div class="top-chrome">
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

    <button
      type="button"
      class="top-chrome__gear"
      :aria-label="t('multiplayer.openProfile')"
      :title="t('multiplayer.openProfile')"
      @click="emit('openProfile')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
        <path
          fill="currentColor"
          d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.77 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.89 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.5.39 1.04.71 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.top-chrome {
  position: fixed;
  top: max(0.75rem, env(safe-area-inset-top, 0px));
  right: max(0.75rem, env(safe-area-inset-right, 0px));
  z-index: 120;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.language-toggle {
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

.top-chrome__gear {
  display: inline-grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.45rem;
  border: 1px solid rgba(126, 207, 90, 0.3);
  background: rgba(20, 26, 20, 0.9);
  color: #b8d4ae;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(6px);
}

.top-chrome__gear:hover {
  color: #e8f0e4;
  border-color: rgba(126, 207, 90, 0.55);
}
</style>
