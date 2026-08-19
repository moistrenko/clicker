const SHORT_SCALE = [
  { value: 1e6, name: 'million' },
  { value: 1e9, name: 'billion' },
  { value: 1e12, name: 'trillion' },
  { value: 1e15, name: 'quadrillion' },
  { value: 1e18, name: 'quintillion' },
  { value: 1e21, name: 'sextillion' },
  { value: 1e24, name: 'septillion' },
  { value: 1e27, name: 'octillion' },
  { value: 1e30, name: 'nonillion' },
  { value: 1e33, name: 'decillion' },
] as const

function formatGroupedInteger(value: number): string {
  return Math.trunc(value).toLocaleString('en-US')
}

function formatShortCoefficient(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  if (Number.isInteger(rounded)) {
    return rounded.toFixed(0)
  }
  return rounded.toFixed(3).replace(/\.?0+$/, '')
}

export function formatCookies(value: number): string {
  if (!Number.isFinite(value)) {
    return '0'
  }

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)

  if (abs < 1_000_000) {
    if (Number.isInteger(abs)) {
      return `${sign}${formatGroupedInteger(abs)}`
    }

    const trimmed = abs
      .toFixed(3)
      .replace(/(\.\d*?)0+$/, '$1')
      .replace(/\.$/, '')
    const [intPart = '0', fracPart] = trimmed.split('.')
    const grouped = Number(intPart).toLocaleString('en-US')
    return fracPart ? `${sign}${grouped}.${fracPart}` : `${sign}${grouped}`
  }

  const firstScale = SHORT_SCALE[0]
  if (!firstScale) {
    return `${sign}${formatGroupedInteger(abs)}`
  }

  let scale: (typeof SHORT_SCALE)[number] = firstScale
  for (const candidate of SHORT_SCALE) {
    if (abs >= candidate.value) {
      scale = candidate
    }
  }

  const coefficient = abs / scale.value
  return `${sign}${formatShortCoefficient(coefficient)} ${scale.name}`
}
