# Agents — Adding a new locale (example: <locale>)

## Purpose

This document describes what an automation agent (or a human reviewer) should do when a new language/locale is added to the site. Use this as a checklist and template — replace `<locale>` with the actual locale code (for example: `zh-cn`, `ja`, `en`).

## Summary of changes (high level)

- Add a new locale `<locale>` across site configuration, UI, content, and tests.
- Localized MDX content for one or more site sections under `src/content/docs/<locale>/`.
- Update i18n metadata and language selector to surface the new locale.
- Add Playwright specs under `tests/<locale>/` to validate localized pages and interactive widgets.
- Minor documentation updates (e.g., `README.md`) to surface quick-start and locale guidance.

## Files added or modified by the diff

- `README.md` (modified)
- `astro.config.mjs` (modified — add `<locale>` entry and translations)
- `src/i18n/languages.ts` (modified — add `<locale>` and prompt templates)
- `src/components/LanguageSelector.svelte` (modified — add the locale option)
- `src/content/docs/<locale>/index.mdx` (new)
- `src/content/docs/<locale>/...` (new localized MDX pages mirroring existing sections, e.g., `geometry/`)
- `tests/<locale>/.../*.spec.ts` (new Playwright specs for localized routes)
- Supporting assets under `src/assets/` or `public/` as needed

## Agent checklist (step-by-step)

1. Review the PR / diff
   - Verify the `<locale>` entries are present in `astro.config.mjs` and `src/i18n/languages.ts`.
   - Confirm `src/content/docs/<locale>/` contains localized MDX pages with correct frontmatter, imports, and component usage.
   - Check localized pages follow the site's content structure and naming conventions.

2. Sanity-check UI changes
   - Confirm `src/components/LanguageSelector.svelte` (or equivalent) includes the new locale option.
   - Spot-check localized pages in the browser at `/<locale>/` and representative routes (e.g., `/<locale>/geometry/...`).
   - Verify language switch preserves route structure and works across client/server navigation.

3. Run locally
   - Install dependencies:
     ```
     npm install
     ```
   - Start the dev server:
     ```
     npm run dev
     ```
   - Open the localized root page:
     ```
     http://localhost:4321/<locale>/
     ```
   - If the site uses a different dev port, adapt accordingly.

4. Run tests
   - Run Playwright tests for the locale subset:
     ```
     npm run test -- tests/<locale>/ --project=chromium
     ```
   - Or run the whole suite:
     ```
     npm run test
     ```
   - If tests require a running server, start it or set `BASE_URL` to the host under test.

5. Accessibility & localization checks
   - Verify ARIA labels, roles, and visible control labels are localized where required.
   - Watch for hardcoded English strings in components (e.g., aria-labels, step labels) — these may need internationalization or test updates.
   - Ensure localized content still meets contrast, focus order, and semantic structure requirements.

6. CI / PR guidance
   - Ensure Playwright tests for the new locale are included in CI (or gated behind a label if adding many locales at once).
   - If tests fail due to hardcoded English strings in components, either:
     - Internationalize the component strings, or
     - Adjust tests to accept localized labels or use locale-aware selectors.
   - Include contributor guidance for adding translations and updating locales.

7. Known issues & notes
   - Note components that commonly contain hardcoded English strings (widgets, Three.js controls, slider labels).
   - Note any client-only components using `client:visible` or dynamic IDs — ensure IDs and aria labels are stable and localizable.
   - If adding multiple locales, consider batching content and tests to keep CI cost and review load manageable.

## Contact

If you need help reviewing or fixing localization issues, mention the maintainers or open an issue that includes failing test output and a link to the PR for faster triage.
