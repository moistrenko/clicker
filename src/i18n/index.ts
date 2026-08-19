import { createI18n } from 'vue-i18n'
import en from './messages/en.json'
import ru from './messages/ru.json'

export type AppLocale = 'en' | 'ru'

export const LOCALE_STORAGE_KEY = 'clicker-locale'

export function readStoredLocale(): AppLocale {
  if (typeof localStorage === 'undefined') {
    return 'en'
  }
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'en' || stored === 'ru') {
    return stored
  }
  const browser = navigator.language.toLowerCase()
  return browser.startsWith('ru') ? 'ru' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: readStoredLocale(),
  fallbackLocale: 'en',
  messages: { en, ru },
})

export function numberLocaleForApp(locale: AppLocale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}
