export type SupportedLocale = {
  code: string;
  label: string;
};

type LanguagePromptTemplate = {
  message: string;
  linkText: string;
};

export const supportedLocales: SupportedLocale[] = [
  {
    code: "en",
    label: "English",
  },
  {
    code: "ja",
    label: "日本語",
  },
];

export const languagePromptTemplates: Record<string, LanguagePromptTemplate> = {
  en: {
    message: "This page is also available in {language}.",
    linkText: "Open in {language}",
  },
  ja: {
    message: "このページは{language}でも読めます。",
    linkText: "{language}で開く",
  },
};

export function normalizeLocale(locale?: string | null) {
  if (!locale) {
    return null;
  }

  const normalized = locale.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return normalized.split("-")[0] ?? null;
}

export function getPathLocale(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return normalizeLocale(firstSegment);
}

export function buildLocalePath(pathname: string, locale: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}/`;
  }

  const [, ...rest] = segments;
  const suffix = rest.length > 0 ? `${rest.join("/")}/` : "";

  return `/${locale}/${suffix}`;
}
