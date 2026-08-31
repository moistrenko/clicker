<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { validateDisplayName, type DisplayNameError } from '@/multiplayer/profileName'
import { useDuelStore } from '@/stores/duel'

const open = defineModel<boolean>('open', { default: false })

const duel = useDuelStore()
const { t } = useI18n()

const draftName = ref('')
const saving = ref(false)
const savedFlash = ref(false)
const formError = ref<DisplayNameError | 'save' | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)

async function loadProfile() {
  formError.value = null
  try {
    const profile = await duel.ensureProfile()
    draftName.value = profile.displayName
  } catch {
    formError.value = 'save'
  }
}

watch(open, async (isOpen) => {
  if (!isOpen) {
    return
  }
  await loadProfile()
  await nextTick()
  nameInput.value?.focus()
  nameInput.value?.select()
})

watch(
  () => duel.profile?.displayName,
  (name) => {
    if (name && !saving.value && open.value) {
      draftName.value = name
    }
  },
)

function close() {
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

async function save() {
  formError.value = validateDisplayName(draftName.value)
  if (formError.value) {
    return
  }
  saving.value = true
  savedFlash.value = false
  try {
    await duel.saveDisplayName(draftName.value)
    savedFlash.value = true
    window.setTimeout(() => {
      savedFlash.value = false
    }, 1800)
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    if (code === 'empty' || code === 'short' || code === 'long' || code === 'invalid') {
      formError.value = code
    } else {
      formError.value = 'save'
    }
  } finally {
    saving.value = false
  }
}

function errorText(code: DisplayNameError | 'save'): string {
  return t(`multiplayer.profileErrors.${code}`)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="profile-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="t('multiplayer.profileTitle')"
    >
      <button type="button" class="profile-modal__backdrop" :aria-label="t('multiplayer.closeProfile')" @click="close" />
      <div class="profile-modal__card">
        <header class="profile-modal__head">
          <h2>{{ t('multiplayer.profileTitle') }}</h2>
          <button type="button" class="profile-modal__close" :aria-label="t('multiplayer.closeProfile')" @click="close">
            ×
          </button>
        </header>
        <p class="profile-modal__hint">{{ t('multiplayer.profileHint') }}</p>

        <label class="profile-modal__field">
          <span>{{ t('multiplayer.displayName') }}</span>
          <input
            ref="nameInput"
            v-model="draftName"
            type="text"
            maxlength="20"
            autocomplete="nickname"
            :disabled="saving || duel.isDueling"
            @keydown.enter.prevent="save"
          />
        </label>

        <div class="profile-modal__actions">
          <button
            type="button"
            class="profile-modal__btn"
            :disabled="saving || duel.isDueling"
            @click="save"
          >
            {{ saving ? t('multiplayer.saving') : t('multiplayer.saveName') }}
          </button>
          <span v-if="savedFlash" class="profile-modal__ok" role="status">{{ t('multiplayer.nameSaved') }}</span>
        </div>
        <p v-if="formError" class="profile-modal__error" role="alert">{{ errorText(formError) }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.profile-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.profile-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(8, 12, 8, 0.72);
  cursor: pointer;
}

.profile-modal__card {
  position: relative;
  z-index: 1;
  width: min(100%, 380px);
  display: grid;
  gap: 0.75rem;
  padding: 1rem 1.1rem 1.15rem;
  border: 1px solid rgba(126, 207, 90, 0.35);
  border-radius: 0.55rem;
  background: linear-gradient(180deg, #243024 0%, #171d16 100%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  color: #e8f0e4;
}

.profile-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.profile-modal__head h2 {
  margin: 0;
  font-family: Rajdhani, 'Source Sans 3', sans-serif;
  font-size: 1.15rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ecf7a;
}

.profile-modal__close {
  border: 0;
  background: transparent;
  color: #8fa888;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.1rem 0.35rem;
}

.profile-modal__hint {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: #c8d8c0;
}

.profile-modal__field {
  display: grid;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #8fa888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-modal__field input {
  border: 1px solid #4a5a46;
  border-radius: 0.35rem;
  background: rgba(0, 0, 0, 0.28);
  color: #e8f0e4;
  padding: 0.55rem 0.65rem;
  font: inherit;
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.95rem;
}

.profile-modal__field input:focus {
  outline: 1px solid rgba(126, 207, 90, 0.55);
}

.profile-modal__actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.profile-modal__btn {
  border: 1px solid #6a8f4a;
  background: linear-gradient(180deg, #4a6a38 0%, #334a28 100%);
  color: #f0f8ec;
  padding: 0.5rem 0.9rem;
  border-radius: 0.35rem;
  cursor: pointer;
  font-weight: 700;
}

.profile-modal__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.profile-modal__ok {
  font-size: 0.75rem;
  color: #9ecf7a;
}

.profile-modal__error {
  margin: 0;
  font-size: 0.75rem;
  color: #f0a0a0;
}
</style>
