import { watch } from 'vue'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import {
  LOCALE_STORAGE_KEY,
  numberLocaleForApp,
  type AppLocale,
} from '@/i18n'

export const useLocaleStore = defineStore('locale', () => {
  const { locale } = useI18n()

  function setLocale(next: AppLocale) {
    locale.value = next
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
    document.documentElement.lang = next
  }

  function toggleLocale() {
    setLocale(locale.value === 'ru' ? 'en' : 'ru')
  }

  watch(
    locale,
    (value) => {
      document.documentElement.lang = value
    },
    { immediate: true },
  )

  return {
    locale,
    numberLocale: () => numberLocaleForApp(locale.value as AppLocale),
    setLocale,
    toggleLocale,
  }
})
