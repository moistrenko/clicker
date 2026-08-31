const DISPLAY_NAME_MIN = 2
const DISPLAY_NAME_MAX = 20
const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N} _.-]+$/u

export type DisplayNameError = 'empty' | 'short' | 'long' | 'invalid'

export function normalizeDisplayName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

export function validateDisplayName(raw: string): DisplayNameError | null {
  const name = normalizeDisplayName(raw)
  if (!name) {
    return 'empty'
  }
  if (name.length < DISPLAY_NAME_MIN) {
    return 'short'
  }
  if (name.length > DISPLAY_NAME_MAX) {
    return 'long'
  }
  if (!DISPLAY_NAME_PATTERN.test(name)) {
    return 'invalid'
  }
  return null
}

export { DISPLAY_NAME_MAX, DISPLAY_NAME_MIN }
