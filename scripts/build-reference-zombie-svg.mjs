import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const source = join(root, 'src/assets/theme/zombie-reference.raw.svg')
const target = join(root, 'src/assets/theme/click-target.svg')

let svg = readFileSync(source, 'utf8')
svg = svg.replace(/<\?xml[\s\S]*?>\s*/i, '')
svg = svg.replace(/<!DOCTYPE[\s\S]*?>\s*/i, '')
svg = svg.replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">`)
svg = svg.replace(
  '<g transform="translate(0.000000,350.000000) scale(0.100000,-0.100000)"\nfill="#000000" stroke="none">',
  `<defs>
    <filter id="shadow" x="-12%" y="-12%" width="124%" height="124%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#060806" flood-opacity="0.45" />
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <g transform="translate(0,350) scale(0.1,-0.1)" fill="#c8dcc0" stroke="none">`,
)
svg = svg.replace('</g>\n</svg>', `</g>
  </g>
</svg>`)

writeFileSync(target, svg)
console.log('written', target, 'bytes', svg.length)
