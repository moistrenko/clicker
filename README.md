# Cookie Clicker analogue

A Vue 3 + TypeScript bakery clicker with Cookie Clicker-style buildings, prices, CpS, and number formatting. The clickable image is themed as a cookie today and is meant to be swapped later.

## Setup

```bash
npm install
```

Requires Node.js 22+.

## Scripts

```bash
npm run dev            # Vite dev server
npm run build          # type-check + production build
npm run preview        # preview the production build
npm run test:unit      # Vitest unit tests
npm run lint           # Oxlint + ESLint
npm run type-check     # vue-tsc
npm run storybook      # Storybook on port 6006
npm run build-storybook
```

## Swap the click target

The whole UI reads the clickable’s image and names from one module:

1. Replace `src/assets/theme/click-target.svg` with your illustration.
2. Edit `src/theme/clickTarget.ts` (`displayName`, `pluralName`, `alt`, and `imageUrl` if the file name changes).

No component hardcodes `cookie.png`. Changing those two files updates the big button, counters, and copy such as “cookies”.
