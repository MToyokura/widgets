# Widgets — Interactive Geometry Widgets

Interactive educational geometry widgets (open educational resources) built with Astro, Svelte, D3 and Three.js. The site contains localized content under `src/content/docs/` (for example `en`, `ja`, `pt`, `zh-cn`, `hi`, `bn`).

## Quick start

Prerequisites:

- Node 24 (Volta recommended — see `package.json` for the pinned Node version).
- `npm` (or `pnpm`/`yarn`) installed.

Install dependencies:

```bash
npm install
```

Run local development server:

```bash
npm run dev
# open http://localhost:4321
```

Build and preview:

```bash
npm run preview
```

Run Playwright tests:

```bash
npm run test
# Run specific tests:
npm run test -- tests/hi/geometry --project=chromium
# or: npm run test -- tests/pt/geometry --project=chromium
```

## Project layout (high level)

- `src/components/` — reusable Svelte components (D3 and Three widgets live here).
- `src/content/docs/` — localized MDX pages (folders per locale: `en`, `ja`, `pt`, `zh-cn`, `hi`, `bn`, etc.).
- `tests/` — Playwright specs grouped by locale (`tests/<locale>/geometry/`).
- `astro.config.mjs`, `package.json` — project configuration and scripts.
- `AGENTS.md` — instructions & checklist for adding locales and CI guidance.

## Adding a new locale

Follow the checklist in `AGENTS.md`
