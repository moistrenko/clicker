const SHORT_SCALE = [
  { value: 1e6, key: 'million' },
  { value: 1e9, key: 'billion' },
  { value: 1e12, key: 'trillion' },
  { value: 1e15, key: 'quadrillion' },
  { value: 1e18, key: 'quintillion' },
  { value: 1e21, key: 'sextillion' },
  { value: 1e24, key: 'septillion' },
  { value: 1e27, key: 'octillion' },
  { value: 1e30, key: 'nonillion' },
  { value: 1e33, key: 'decillion' },
] as const

const DEFAULT_SCALE_NAMES: Record<(typeof SHORT_SCALE)[number]['key'], string> = {
  million: 'million',
  billion: 'billion',
  trillion: 'trillion',
  quadrillion: 'quadrillion',
  quintillion: 'quintillion',
  sextillion: 'sextillion',
  septillion: 'septillion',
  octillion: 'octillion',
  nonillion: 'nonillion',
  decillion: 'decillion',
}

export interface FormatCookiesOptions {
  locale?: string
  scaleNames?: Partial<Record<(typeof SHORT_SCALE)[number]['key'], string>>
}

function formatGroupedInteger(value: number, locale: string): string {
  return Math.trunc(value).toLocaleString(locale)
}

function formatShortCoefficient(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  if (Number.isInteger(rounded)) {
    return rounded.toFixed(0)
  }
  return rounded.toFixed(3).replace(/\.?0+$/, '')
}

export function formatCookies(value: number, options: FormatCookiesOptions = {}): string {
  const locale = options.locale ?? 'en-US'
  const scaleNames = { ...DEFAULT_SCALE_NAMES, ...options.scaleNames }

  if (!Number.isFinite(value)) {
    return '0'
  }

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)

  if (abs < 1_000_000) {
    if (Number.isInteger(abs)) {
      return `${sign}${formatGroupedInteger(abs, locale)}`
    }

    const trimmed = abs
      .toFixed(3)
      .replace(/(\.\d*?)0+$/, '$1')
      .replace(/\.$/, '')
    const [intPart = '0', fracPart] = trimmed.split('.')
    const grouped = Number(intPart).toLocaleString(locale)
    return fracPart ? `${sign}${grouped}.${fracPart}` : `${sign}${grouped}`
  }

  const firstScale = SHORT_SCALE[0]
  if (!firstScale) {
    return `${sign}${formatGroupedInteger(abs, locale)}`
  }

  let scale: (typeof SHORT_SCALE)[number] = firstScale
  for (const candidate of SHORT_SCALE) {
    if (abs >= candidate.value) {
      scale = candidate
    }
  }

  const coefficient = abs / scale.value
  return `${sign}${formatShortCoefficient(coefficient)} ${scaleNames[scale.key]}`
}
