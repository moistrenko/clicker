<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  exportLabel?: string
  importLabel?: string
  wipeLabel?: string
}>()

const emit = defineEmits<{
  exportSave: []
  importSave: [raw: string]
  wipeSave: []
}>()

const importText = ref('')
const importError = ref('')
const copied = ref(false)

async function handleExport() {
  emit('exportSave')
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 2000)
}

function handleImport() {
  importError.value = ''
  const raw = importText.value.trim()
  if (!raw) {
    importError.value = 'Paste a survivor log before importing.'
    return
  }
  emit('importSave', raw)
}

function handleWipe() {
  const confirmed = window.confirm(
    'Wipe this survivor log forever? All kills, weapons, and progress will be lost.',
  )
  if (confirmed) {
    importText.value = ''
    importError.value = ''
    emit('wipeSave')
  }
}

function setImportError(message: string) {
  importError.value = message
}

defineExpose({ setImportError })
</script>

<template>
  <details class="settings">
    <summary class="settings__toggle">Survivor log</summary>

    <div class="settings__body">
      <p class="settings__hint">Back up, restore, or purge your horde progress.</p>

      <div class="settings__actions">
        <button type="button" class="settings__btn" @click="handleExport">
          {{ exportLabel ?? 'Export log' }}
        </button>
        <span v-if="copied" class="settings__copied" role="status">Copied to clipboard</span>
      </div>

      <label class="settings__field">
        <span class="settings__label">{{ importLabel ?? 'Import log' }}</span>
        <textarea
          v-model="importText"
          class="settings__textarea"
          rows="4"
          placeholder="Paste exported survivor log JSON here…"
          spellcheck="false"
        />
      </label>

      <button type="button" class="settings__btn settings__btn--import" @click="handleImport">
        Apply imported log
      </button>
      <p v-if="importError" class="settings__error" role="alert">{{ importError }}</p>

      <button type="button" class="settings__btn settings__btn--wipe" @click="handleWipe">
        {{ wipeLabel ?? 'Wipe log' }}
      </button>
    </div>
  </details>
</template>

<style scoped>
.settings {
  border-top: 1px solid #4a5a46;
  padding-top: 0.75rem;
}

.settings__toggle {
  cursor: pointer;
  font-size: 1.05rem;
  color: #b8d4ae;
  list-style: none;
}

.settings__toggle::-webkit-details-marker {
  display: none;
}

.settings__body {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.settings__hint {
  font-size: 0.82rem;
  color: #8fa888;
  line-height: 1.35;
}

.settings__actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.settings__field {
  display: grid;
  gap: 0.35rem;
}

.settings__label {
  font-size: 0.82rem;
  color: #9ecf7a;
}

.settings__textarea {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #4a5a46;
  background: rgba(20, 26, 20, 0.85);
  color: #e8f0e4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  resize: vertical;
}

.settings__btn {
  width: fit-content;
  padding: 0.5rem 0.85rem;
  border: 1px solid #6a8a62;
  border-radius: 8px;
  background: rgba(42, 52, 40, 0.95);
  color: #e8f0e4;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.settings__btn:hover {
  filter: brightness(1.08);
}

.settings__btn--import {
  border-color: #7ecf5a;
  background: linear-gradient(180deg, #4a7040 0%, #3a5832 100%);
}

.settings__btn--wipe {
  border-color: #8a4a4a;
  color: #f0c8c8;
  background: rgba(60, 32, 32, 0.85);
}

.settings__copied {
  font-size: 0.78rem;
  color: #9ecf7a;
}

.settings__error {
  font-size: 0.78rem;
  color: #f0a0a0;
}
</style>
