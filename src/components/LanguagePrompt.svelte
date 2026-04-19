<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import type { SupportedLocale } from "../i18n/languages";
  import {
    buildLocalePath,
    getPathLocale,
    languagePromptTemplates,
    normalizeLocale,
    supportedLocales,
  } from "../i18n/languages";

  type AlternateLocale = {
    code: string;
    label: string;
    href: string;
  };

  let {
    currentLocale = undefined,
    pathname = "",
    locales = supportedLocales,
  }: {
    currentLocale?: string | null | undefined;
    pathname?: string;
    locales?: SupportedLocale[];
  } = $props();

  let hidden = $state(true);
  let messageText = $state("");
  let linkText = $state("");
  let linkHref = $state("#");

  const normalizeBrowserLocale = (locale: string | null | undefined) =>
    normalizeLocale(locale);

  const getAlternateLocales = (
    currentPathname: string,
    currentLocaleProp: string | null | undefined,
    localeListProp: SupportedLocale[],
  ): AlternateLocale[] => {
    const localeList =
      Array.isArray(localeListProp) && localeListProp.length > 0
        ? localeListProp
        : supportedLocales;
    const resolvedCurrentLocale =
      normalizeLocale(currentLocaleProp) ??
      getPathLocale(currentPathname) ??
      supportedLocales[0]?.code ??
      "en";

    return localeList
      .filter((locale) => locale.code !== resolvedCurrentLocale)
      .map((locale) => ({
        code: locale.code,
        label: locale.label,
        href: buildLocalePath(currentPathname, locale.code),
      }));
  };

  onMount(() => {
    const currentPathname = pathname || window.location.pathname;
    const alternateLocales = getAlternateLocales(
      currentPathname,
      currentLocale,
      locales,
    );
    const browserLocales = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    const preferredLocales = Array.from(
      new Set(
        browserLocales
          .map(normalizeBrowserLocale)
          .filter((locale): locale is string => Boolean(locale)),
      ),
    );
    const matchingLocale = preferredLocales
      .map((preferredLocale) =>
        alternateLocales.find(({ code }) => code === preferredLocale),
      )
      .find((locale): locale is AlternateLocale => Boolean(locale));

    if (!matchingLocale) {
      return;
    }

    const promptLocale =
      preferredLocales.find(
        (preferredLocale) => languagePromptTemplates[preferredLocale],
      ) ?? matchingLocale.code;
    const promptTemplates =
      languagePromptTemplates[promptLocale] ?? languagePromptTemplates.en;
    const displayNames =
      typeof Intl.DisplayNames === "function"
        ? new Intl.DisplayNames([promptLocale], { type: "language" })
        : null;
    const languageLabel =
      displayNames?.of(matchingLocale.code) ?? matchingLocale.label;

    messageText = promptTemplates.message.replace("{language}", languageLabel);
    linkText = promptTemplates.linkText.replace("{language}", languageLabel);
    linkHref = matchingLocale.href;
    hidden = false;
  });
</script>

<div class="language-prompt" role="note" aria-live="polite" {hidden}>
  <span>{messageText}</span>
  <a href={linkHref}>{linkText}</a>
</div>

<style>
  .language-prompt {
    margin: 0 auto 1.5rem;
    max-width: 800px;
    padding: 0.9rem 1.1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.75rem;
    background: var(--sl-color-gray-6);
    color: var(--sl-color-gray-2);
    text-align: center;
  }

  .language-prompt a {
    margin-left: 0.4rem;
    color: var(--sl-color-accent-high);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
</style>
